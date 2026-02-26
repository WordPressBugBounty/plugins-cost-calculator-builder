<?php

namespace cBuilder\Classes;

use cBuilder\Classes\Database\CalcOrders;
use cBuilder\Classes\Database\Discounts;
use cBuilder\Classes\Database\Promocodes;
use cBuilder\Helpers\CCBCleanHelper;
use cBuilder\Classes\Database\OrdersStatuses;
use cBuilder\Classes\Database\OrdersPayments;
use cBuilder\Classes\Database\OrdersNotes;

class CCBOrderController {

	public static $numAfterInteger = 2;
	protected static $errors       = array();

	/**
	 * Validation
	 *
	 * @param $data
	 */
	public static function validate( $data ) {
		if ( ! array_key_exists( 'id', $data ) || ! $data['id'] || empty( $data['id'] ) ) {
			self::$errors['id'] = __( 'No calculator id' );
		}
	}

	public static function validateFile( $file, $field_id, $calc_id ) {
		if ( empty( $file ) ) {
			return false;
		}

		$file_upload_field = null;
		$calc_fields       = get_post_meta( $calc_id, 'stm-fields', true );
		preg_match( '/(_\d+)$/', $field_id, $key );

		foreach ( $calc_fields as $field ) {
			if ( ! empty( $field['alias'] ) && $field_id === $field['alias'] ) {
				$file_upload_field = $field;
			} elseif ( ! empty( $field['alias'] ) && ! empty( $field['groupElements'] ) ) {
				foreach ( $field['groupElements'] as $section_field ) {
					if ( ! empty( $section_field['fields'] ) ) {
						foreach ( $section_field['fields'] as $_field ) {
							if ( ! empty( $_field['alias'] ) ) {
								$possible_aliases = array( $_field['alias'], $_field['alias'] . $key[0] );
								if ( in_array( $field_id, $possible_aliases, true ) ) {
									$file_upload_field = $_field;
								}
							}

							if ( ! empty( $_field['groupElements'] ) ) {
								foreach ( $_field['groupElements'] as $__field ) {
									if ( ! empty( $__field['alias'] ) ) {
										$possible_aliases = array( $__field['alias'], $__field['alias'] . $key[0] );
										if ( in_array( $field_id, $possible_aliases, true ) ) {
											$file_upload_field = $__field;
										}
									}
								}
							}
						}
					}
				}
			}
		}

		/** get file field settings */
		$extension       = strtolower( pathinfo( $file['name'], PATHINFO_EXTENSION ) );
		$allowed_formats = array();

		if ( isset( $file_upload_field['fileFormats'] ) ) {
			foreach ( $file_upload_field['fileFormats'] as $format ) {
				$allowed_formats = array_merge( $allowed_formats, explode( '/', $format ) );
			}
		}

		/** check file extension */
		if ( ! in_array( $extension, $allowed_formats, true ) ) {
			return false;
		}

		/** check file size */
		if ( $file_upload_field['max_file_size'] < round( $file['size'] / 1024 / 1024, 1 ) ) {
			return false;
		}

		return true;
	}


	public static function create() {
		check_ajax_referer( 'ccb_add_order', 'nonce' );

		$result = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		$data = null;
		if ( ! empty( $_POST['data'] ) ) {
			$data = ccb_convert_from_btoa( $_POST['data'] );

			if ( ! ccb_is_convert_correct( $data ) ) {
				wp_send_json( $result );
			}
		}

		/**  sanitize POST data  */
		$data = CCBCleanHelper::cleanData( (array) json_decode( stripslashes( $data ) ) );

		self::validate( $data );

		if ( empty( $data['id'] ) && empty( $data['totals'] ) && empty( $data['orderDetails'] ) ) {
			wp_send_json( $result );
		}

		if ( ccb_pro_active() ) {
			$data = CCBCalculator::validate_totals( $data );
		}

		$payment_method = $data['paymentMethod'] ?? '';
		$check_action   = self::check_action( $payment_method, $data['id'] );

		if ( ! $check_action ) {
			$result['message'] = 'Invalid payment method';
			wp_send_json( $result );
		}

		/**
		 *  if  order Id exist not create new one.
		 *  Used just for stripe if card error was found
		 */
		if ( ! empty( $data['orderId'] ) ) {
			$order = CalcOrders::get_order_full_data_by_id( $data['orderId'] );
			if ( ! empty( $order ) ) {
				wp_send_json_success(
					array(
						'status'   => 'success',
						'order_id' => $data['orderId'],
					)
				);
				die();
			}
		}

		if ( ! empty( $data['promocodes'] ) ) {
			$promocodes = Discounts::get_promocodes_by_promocode( $data['id'], $data['promocodes'] );
			foreach ( $promocodes as $promocode ) {
				if ( ! empty( $promocode['promocode_count'] ) && $promocode['promocode_count'] > 0 ) {
					$promocode_count = intval( $promocode['promocode_count'] );
					$promocode_used  = ! empty( $promocode['promocode_used'] ) ? intval( $promocode['promocode_used'] ) : 0;
					if ( $promocode_count > $promocode_used ) {
						$update_data = array( 'promocode_used' => $promocode_used + 1 );
						Promocodes::update_discount_condition( $update_data, $promocode['promocode_id'] );
					} else {
						wp_send_json_error(
							array(
								'status'  => 'error',
								'message' => $promocode['promocode'] . ' is out of stock',
							)
						);
						die();
					}
				}
			}
		}

		$uploaded_files = array();
		if ( empty( self::$errors ) && 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			$settings = CCBSettingsData::get_calc_single_settings( $data['id'] );
			if ( array_key_exists( 'num_after_integer', $settings['currency'] ) ) {
				self::$numAfterInteger = (int) $settings['currency']['num_after_integer'];
			}

			/** upload files if exist */
			if ( is_array( $_FILES ) ) {
				if ( ! function_exists( 'wp_handle_upload' ) ) {
					require_once ABSPATH . 'wp-admin/includes/file.php';
				}

				$order_details = array();
				$file_url      = array();

				foreach ( $data['orderDetails'] as $detail ) {
					if ( ! empty( $detail['alias'] ) && isset( $detail['repeaterAlias'] ) && str_contains( $detail['repeaterAlias'], 'repeater' ) ) {
						$detail['alias'] = $detail['alias'] . '_' . $detail['idx'];
						$order_details[] = $detail;
					} else {
						$order_details[] = $detail;
					}
				}

				/** upload all files, create array for fields */
				foreach ( $_FILES as $file_key => $file ) {
					$field_id          = preg_replace( '/_ccb_.*/', '', $file_key );
					$file_upload_field = null;
					preg_match( '/(_\d+)$/', $field_id, $key );

					foreach ( $order_details as $field ) {
						if ( isset( $field['alias'] ) && ! empty( $field['alias'] ) ) {
							if ( $field['alias'] === $field_id ) {
								$file_upload_field = $field;
							}
						}
					}

					/** if field not found continue */
					if ( is_null( $file_upload_field ) ) {
						continue;
					}

					/** validate file by settings */
					$is_valid = self::validateFile( $file, $field_id, $data['id'] );

					if ( ! $is_valid ) {
						continue;
					}

					if ( empty( $file_url[ $field_id ] ) ) {
						$file_url[ $field_id ] = array();
					}

					if ( ! empty( $file['name'] ) ) {
						$upload_dir   = wp_upload_dir();
						$image_info   = getimagesize( $file['tmp_name'] );
						$file['name'] = sanitize_file_name( $file['name'] );

						$file_hash  = md5_file( $file['tmp_name'] );
						$short_hash = substr( $file_hash, 0, 8 ); // Используем первые 8 символов для краткости

						$file_extension = pathinfo( $file['name'], PATHINFO_EXTENSION );
						$file_basename  = pathinfo( $file['name'], PATHINFO_FILENAME );

						if ( isset( $image_info['mime'] ) ) {
							$file_extension = ltrim( ccb_get_format_by_mime( $image_info['mime'] ), '.' );
						}

						$file_name = $file_basename . '_' . $short_hash . '.' . $file_extension;
						$file_path = $upload_dir['path'] . '/' . $file_name;

						if ( file_exists( $file_path ) ) {
							$file_info = array(
								'url'      => trailingslashit( $upload_dir['url'] ) . $file_name,
								'file'     => $file_path,
								'size'     => filesize( $file_path ),
								'type'     => mime_content_type( $file_path ),
								'filename' => $file_name,
							);
						} else {
							$original_name = $file['name'];
							$file['name']  = $file_name;
							$file_info     = wp_handle_upload( $file, array( 'test_form' => false ) );
							$file['name']  = $original_name;
						}

						if ( ! empty( $file_info['file'] ) && str_contains( $file['type'], 'svg' ) ) {
							$svg_sanitizer = new \enshrined\svgSanitize\Sanitizer();
							$dirty_svg     = file_get_contents( $file_info['file'] ); //phpcs:ignore
							$clean_svg     = $svg_sanitizer->sanitize( $dirty_svg );
							file_put_contents( $file_info['file'], $clean_svg ); //phpcs:ignore
						}

						if ( $file_info && empty( $file_info['error'] ) ) {
							array_push( $file_url[ $field_id ], $file_info );
						}

						$uploaded_files[ $file_key ] = array(
							'file_info'  => $file_info,
							'short_hash' => $short_hash,
						);
					}
				}

				foreach ( $order_details as $field_key => $field ) {
					if ( ! empty( $field['alias'] ) && preg_replace( '/_field_id.*/', '', $field['alias'] ) === 'file_upload' ) {
						$file_key = $field['alias'];
						if ( isset( $file_url[ $file_key ] ) ) {
							$order_details[ $field_key ]['options'] = $file_url[ $file_key ];
						}
					}
				}

				$data['orderDetails'] = $order_details;
			}

			foreach ( $data['orderDetails'] as $key => $field ) {
				if ( isset( $field['alias'] ) && str_contains( $field['alias'], 'text_area' ) ) {
					$field[ $key ]['value'] = sanitize_text_field( $field[ $key ]['value'] );
				}
			}

			$total = number_format( (float) $data['total'], self::$numAfterInteger, '.', '' );

			if ( empty( $total ) ) {
				$total = 0;
			}

			$currency = array_key_exists( 'currency', $settings['currency'] ) ? $settings['currency']['currency'] : null;
			if ( 'paypal' === $data['paymentMethod'] ) {
				$general_settings = CCBSettingsData::get_calc_global_settings();
				if ( ! empty( $general_settings['payment_gateway']['paypal']['use_in_all'] ) ) {
					$currency = $general_settings['payment_gateway']['paypal']['currency_code'];
				} else {
					$currency = $settings['payment_gateway']['paypal']['currency_code'];
				}
			}

			$calc_title = get_post_meta( $data['id'], 'stm-name', true );

			$order_primary_data = array(
				'calc_id'      => $data['id'],
				'total_amount' => $total,
				'calc_title'   => get_post_meta( $data['id'], 'stm-name', true ),
				'old_order_id' => null,
			);

			$default_status = OrdersStatuses::get_default_status();

			$payment_primary_data = array(
				'order_id'       => null,
				'payment_type'   => ! empty( $data['paymentMethod'] ) ? $data['paymentMethod'] : 'no_payments',
				'payment_status' => $default_status['id'],
				'total'          => $total,
			);

			$discounts    = array();
			$merged_array = array_merge( $data['totals'], $data['otherTotals'] );
			if ( ! empty( $merged_array ) ) {
				foreach ( $merged_array as $total ) {
					if ( ! empty( $total['hasDiscount'] ) ) {
						if ( empty( $discounts[ $total['alias'] ] ) ) {
							$discounts[ $total['alias'] ] = array();
						}

						$discounts[ $total['alias'] ][] = array(
							'discount_view'         => $total['discount']['discountView'],
							'discount_title'        => $total['discount']['discountTitle'],
							'discount_type'         => $total['discount']['discountType'],
							'discount_amount'       => $total['discount']['discountAmount'],
							'discount_value'        => $total['discount']['discountValue'],
							'before_discount_value' => $total['summary'],
						);
					}
				}
			}

			$converted_data    = ! empty( $data['converted'] ) ? $data['converted'] : array();
			$currency_settings = ccb_parse_currency_format( $converted_data );

			$totals       = array();
			$other_totals = array();
			foreach ( $data['totals'] as $total ) {
				if ( ! empty( $total['hidden'] ) ) {
					continue;
				}
				$totals[] = $total;
			}

			foreach ( $data['otherTotals'] as $total ) {
				if ( ! empty( $total['hidden'] ) ) {
					continue;
				}
				$other_totals[] = $total;
			}

			$order_create_data = array(
				'order_data'        => $order_primary_data,
				'form_details'      => $data['formDetails']['fields'],
				'calculator_fields' => $data['orderDetails'],
				'currency'          => $currency_settings,
				'discounts'         => $discounts,
				'promocodes'        => ! empty( $data['promocodes'] ) ? $data['promocodes'] : array(),
				'totals'            => $totals,
				'other_totals'      => $other_totals,
				'payment_details'   => $payment_primary_data,
				'created_at'        => wp_date( 'Y-m-d H:i:s' ),
			);

			if ( ! empty( $data['paymentMethod'] ) ) {
				apply_filters( 'ccb_orders_before_create', $order_create_data );
				$id = CalcOrders::create_order( $order_create_data );
				$order_create_data['payment_details']['order_id'] = $id;
				do_action( 'ccb_after_create_order', $order_create_data );
				do_action( 'ccb_order_created', $order_create_data, $payment_primary_data );

				$message         = '';
				$data['orderId'] = $id;
				$data['calcId']  = $data['id'];
				if ( 'no_payments' === $data['paymentMethod'] ) {
					\cBuilder\Classes\CCBContactForm::ccb_send_form( $id, $data, $uploaded_files );
					$message = esc_html__( 'Your order has been placed', 'cost-calculator-builder' );
				} elseif ( 'cash_payment' === $data['paymentMethod'] ) {
					\cBuilder\Classes\Payments\CCBCashPayment::renderPayment( $data, $id, $uploaded_files );
					$message = esc_html__( 'Cash payment applied successfully', 'cost-calculator-builder' );
				} elseif ( 'paypal' === $data['paymentMethod'] ) {
					\cBuilder\Classes\Payments\CCBPayPal::renderPayment( $data, $id, $uploaded_files );
					$message = esc_html__( 'Paypal payment applied successfully', 'cost-calculator-builder' );
				} elseif ( 'stripe' === $data['paymentMethod'] ) {
					\cBuilder\Classes\Payments\CCBStripe::intent_payment( $data, $id, $uploaded_files );
					$message = esc_html__( 'Stripe payment applied successfully', 'cost-calculator-builder' );
				} elseif ( 'razorpay' === $data['paymentMethod'] ) {
					\cBuilder\Classes\Payments\CCBRazorPay::renderPayment( $data, $id, $uploaded_files );
					$message = esc_html__( 'Razorpay payment applied successfully', 'cost-calculator-builder' );
				} elseif ( 'woocommerce' === $data['paymentMethod'] ) {
					\cBuilder\Classes\CCBWooCheckout::init( $data, $id );
					$message = esc_html__( 'Added to cart successfully', 'cost-calculator-builder' );
				}

				wp_send_json_success(
					array(
						'status'  => 'success',
						'orderId' => $id,
						'message' => $message,
					)
				);
			}

			wp_send_json_success(
				array(
					'status'   => 'error',
					'order_id' => null,
					'message'  => __( 'Invalid payment method', 'cost-calculator-builder' ),
				)
			);
		}

		wp_send_json( $result );
	}

	public static function delete() {}

	public static function renderWooCommercePayment() {
		check_ajax_referer( 'ccb_woocommerce_payment', 'nonce' );

		$data = null;

		if ( isset( $_POST['data'] ) ) {
			$data = ccb_convert_from_btoa( $_POST['data'] );
			if ( ! ccb_is_convert_correct( $data ) ) {
				wp_send_json(
					array(
						'status'  => 'error',
						'success' => false,
						'message' => __( 'Invalid data', 'cost-calculator-builder' ),
					)
				);
			}
		}

		$data     = (array) json_decode( stripslashes( $data ), true );
		$order_id = $data['orderId'] ?? null;

		if ( is_null( $order_id ) ) {
			wp_send_json(
				array(
					'status'  => 'error',
					'success' => false,
					'message' => __( 'Invalid data', 'cost-calculator-builder' ),
				)
			);
		}

		\cBuilder\Classes\CCBWooCheckout::init( $data, $order_id );
	}

	public static function orders_list() {
		check_ajax_referer( 'ccb_orders_list', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json(
				array(
					'status'  => 'error',
					'success' => false,
					'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
				)
			);
		}

		$page   = ! empty( $_GET['page'] ) ? (int) sanitize_text_field( $_GET['page'] ) : 1;
		$limit  = ! empty( $_GET['limit'] ) ? sanitize_text_field( $_GET['limit'] ) : 5;
		$offset = 1 === $page ? 0 : ( $page - 1 ) * $limit;
		$search = ! empty( $_GET['search'] ) ? $_GET['search'] : '';
		$sort   = ! empty( $_GET['sort'] ) ? $_GET['sort'] : '';
		$filter = ! empty( $_GET['filter'] ) ? $_GET['filter'] : null;

		$data     = CalcOrders::get_order_full_data( $limit, $offset, $search, $sort, $filter );
		$total    = CalcOrders::orders_count( $search, $filter );
		$statuses = OrdersStatuses::get_all_statuses_with_count( $search, $filter );

		wp_send_json(
			array(
				'message' => __( 'Orders fetched successfully', 'cost-calculator-builder' ),
				'success' => true,
				'data'    => array(
					'orders'           => $data,
					'total'            => $total,
					'statuses'         => $statuses,
					'table_settings'   => CalcOrders::get_table_settings(),
					'details_settings' => CalcOrders::get_order_details_settings(),
				),
			)
		);

	}

	public static function update_status_list() {
		check_ajax_referer( 'ccb_update_status_list', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		if ( isset( $data['statuses'] ) ) {
			$statuses    = OrdersStatuses::get_all_statuses();
			$status_list = $data['statuses'];

			$status_map      = array();
			$status_list_map = array();

			foreach ( $statuses as $status ) {
				$status_map[ $status['id'] ] = $status;
			}

			foreach ( $status_list as $status ) {
				$status_list_map[ $status['id'] ] = $status;
			}

			$updated_statuses = array();
			$new_statuses     = array();
			$default_status   = null;
			$completed_status = null;

			foreach ( $status_list_map as $status ) {
				if ( ! empty( $status['is_default'] ) ) {
					$default_status = $status;
				}

				if ( ! empty( $status['is_completed'] ) ) {
					$completed_status = $status;
				}

				$current = ! empty( $status_map[ $status['id'] ] ) ? $status_map[ $status['id'] ] : null;
				if ( empty( $current ) ) {
					$new_statuses[] = $status;
				} elseif ( ! empty( $current ) && ( $current['status_name'] !== $status['status_name'] || $current['color'] !== $status['color'] || $current['sort_id'] !== $status['sort_id'] ) ) {
					$updated_statuses[] = $status;
				}
			}

			$delete_statuses = array();
			foreach ( $status_map as $status ) {
				if ( ! isset( $status_list_map[ $status['id'] ] ) ) {
					$delete_statuses[] = $status['id'];
				}
			}

			if ( ! empty( $delete_statuses ) ) {
				self::delete_status_list_action( $delete_statuses );
			}

			if ( ! empty( $new_statuses ) ) {
				foreach ( $new_statuses as $new_status ) {
					$args = array(
						'is_default'   => ! empty( $new_status['is_default'] ) ? 1 : 0,
						'is_completed' => ! empty( $new_status['is_completed'] ) ? 1 : 0,
					);
					OrdersStatuses::create_status( $new_status['status_name'], $new_status['slug'], $new_status['color'], $new_status['sort_id'], $args );
				}
			}

			if ( ! empty( $updated_statuses ) ) {
				foreach ( $updated_statuses as $updated_status ) {
					OrdersStatuses::update_status( $updated_status['id'], $updated_status );
				}
			}

			if ( ! empty( $default_status ) ) {
				OrdersStatuses::make_default( $default_status['id'] );
			}

			if ( ! empty( $completed_status ) ) {
				OrdersStatuses::make_completed( $completed_status['id'] );
			}

			$statuses = OrdersStatuses::get_all_statuses_with_count();

			$result['success'] = true;
			$result['message'] = __( 'Statuses updated successfully', 'cost-calculator-builder' );
			$result['data']    = array(
				'statuses' => $statuses,
			);
		}

		wp_send_json( $result );
	}

	public static function update_order_status() {
		check_ajax_referer( 'ccb_update_order_status', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$order_id  = isset( $data['order_id'] ) ? (int) $data['order_id'] : null;
		$status_id = isset( $data['status_id'] ) ? (int) $data['status_id'] : null;

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( is_null( $order_id ) || is_null( $status_id ) ) {
			wp_send_json( $response );
		}

		$order = CalcOrders::get_order_full_data_by_id( $order_id );
		if ( empty( $order ) ) {
			$response['message'] = __( 'Order not found', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$status = OrdersStatuses::get_status_by_id( $status_id );

		if ( empty( $status ) ) {
			$response['message'] = __( 'Status not found', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		OrdersPayments::update_payment_status_by_order_id( $order_id, $status_id );

		$response['success'] = true;
		$response['message'] = __( 'Order status updated successfully', 'cost-calculator-builder' );
		wp_send_json( $response );

	}

	public static function save_table_settings() {
		check_ajax_referer( 'ccb_save_table_settings', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$settings = $data['settings'];

		if ( empty( $settings ) ) {
			$response['message'] = __( 'Invalid data', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		CalcOrders::update_table_settings( $settings );

		$response['success'] = true;
		$response['message'] = __( 'Table settings saved successfully', 'cost-calculator-builder' );
		wp_send_json( $response );
	}

	public static function save_orders_settings() {
		check_ajax_referer( 'ccb_save_orders_settings', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$settings = $data['settings'];

		if ( empty( $settings ) ) {
			$response['message'] = __( 'Invalid data', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		CalcOrders::update_order_details_settings( $settings );

		$response['success'] = true;
		$response['message'] = __( 'Orders settings saved successfully', 'cost-calculator-builder' );
		wp_send_json( $response );
	}

	public static function restore_orders_settings() {
		check_ajax_referer( 'ccb_restore_orders_settings', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $response );
		}

		$settings = CalcOrders::get_order_details_settings( true );

		$response['success'] = true;
		$response['message'] = __( 'Orders settings restored successfully', 'cost-calculator-builder' );
		$response['data']    = array(
			'settings' => $settings,
		);
		wp_send_json( $response );
	}

	public static function restore_table_settings() {
		check_ajax_referer( 'ccb_restore_table_settings', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $response );
		}

		$settings = CalcOrders::get_table_settings( true );

		$response['success'] = true;
		$response['message'] = __( 'Table settings restored successfully', 'cost-calculator-builder' );
		$response['data']    = array(
			'settings' => $settings,
		);
		wp_send_json( $response );
	}

	public static function delete_status_list_action( $ids ) {
		if ( empty( $ids ) || ! is_array( $ids ) ) {
			return false;
		}

		foreach ( $ids as $id ) {
			$status         = OrdersStatuses::get_status_by_id( $id );
			$default_status = OrdersStatuses::get_default_status();

			if ( empty( $status ) || empty( $default_status ) ) {
				return false;
			}

			if ( $status['id'] === $default_status['id'] ) {
				return false;
			}

			$completed_status = OrdersStatuses::get_completed_status();
			if ( $status['id'] === $completed_status['id'] ) {
				return false;
			}

			$orders_status_ids = OrdersPayments::get_all_orders_payment_status_ids_by_status_id( $id );
			if ( ! empty( $orders_status_ids ) ) {
				$orders_status_ids = array_map( 'intval', array_column( $orders_status_ids, 'order_id' ) );
				OrdersPayments::set_payment_default_status( $orders_status_ids, $default_status['id'] );
			}

			OrdersStatuses::delete_status( $id );
		}

		return true;
	}

	public static function delete_order() {
		check_ajax_referer( 'ccb_delete_order', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$response['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$id = isset( $_GET['id'] ) ? (int) $_GET['id'] : null;

		if ( empty( $id ) || ! is_numeric( $id ) ) {
			wp_send_json( $response );
		}

		$order = CalcOrders::get_order_by_id( $id );
		if ( empty( $order ) ) {
			$response['message'] = __( 'Order not found', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		CalcOrders::delete_order( $id );

		$response['success'] = true;
		$response['status']  = 'success';
		$response['message'] = __( 'Order deleted successfully', 'cost-calculator-builder' );
		wp_send_json( $response );
	}

	public static function create_order_note() {
		check_ajax_referer( 'ccb_create_order_note', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$response['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$order_id = isset( $data['order_id'] ) ? (int) $data['order_id'] : null;
		$content  = isset( $data['content'] ) ? sanitize_text_field( $data['content'] ) : null;

		if ( empty( $order_id ) || empty( $content ) ) {
			wp_send_json( $response );
		}

		OrdersNotes::create_note( $order_id, array( 'content' => $content ) );

		$response['success'] = true;
		$response['status']  = 'success';
		$response['message'] = __( 'Order note created successfully', 'cost-calculator-builder' );
		$response['data']    = array(
			'notes' => OrdersNotes::get_all_notes_by_order_id( $order_id ),
		);

		wp_send_json( $response );

	}

	public static function update_order_note() {
		check_ajax_referer( 'ccb_update_order_note', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$response['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$content = isset( $data['content'] ) ? sanitize_text_field( $data['content'] ) : null;
		$note_id = isset( $data['note_id'] ) ? (int) $data['note_id'] : null;

		if ( empty( $content ) || empty( $note_id ) ) {
			wp_send_json( $response );
		}

		$note = OrdersNotes::get_note_by_id( $note_id );
		if ( empty( $note ) ) {
			$response['message'] = __( 'Note not found', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		OrdersNotes::update_note( $note_id, array( 'content' => $content ) );

		$response['success'] = true;
		$response['status']  = 'success';
		$response['message'] = __( 'Order note updated successfully', 'cost-calculator-builder' );
		$response['data']    = array(
			'notes' => OrdersNotes::get_all_notes_by_order_id( $note['order_id'] ),
		);
		wp_send_json( $response );
	}

	public static function delete_order_note() {
		check_ajax_referer( 'ccb_delete_order_note', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$response['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$note_id = isset( $_GET['note_id'] ) ? (int) $_GET['note_id'] : null;

		if ( empty( $note_id ) || ! is_numeric( $note_id ) ) {
			wp_send_json( $response );
		}

		$note = OrdersNotes::get_note_by_id( $note_id );
		if ( empty( $note ) ) {
			$response['message'] = __( 'Note not found', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		OrdersNotes::delete_note_by_id( $note_id );

		$response['success'] = true;
		$response['status']  = 'success';
		$response['message'] = __( 'Order note deleted successfully', 'cost-calculator-builder' );
		$response['data']    = array(
			'notes' => OrdersNotes::get_all_notes_by_order_id( $note['order_id'] ),
		);
		wp_send_json( $response );
	}

	public static function delete_orders() {
		check_ajax_referer( 'ccb_delete_orders', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$response['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$order_ids = ! empty( $data['order_ids'] ) ? array_map( 'intval', $data['order_ids'] ) : array();
		if ( empty( $order_ids ) ) {
			wp_send_json( $response );
		}

		foreach ( $order_ids as $order_id ) {
			$order = CalcOrders::get_order_by_id( $order_id );
			if ( ! empty( $order ) ) {
				CalcOrders::delete_order( $order_id );
			}
		}

		$response['success'] = true;
		$response['status']  = 'success';
		$response['message'] = __( 'Orders deleted successfully', 'cost-calculator-builder' );
		wp_send_json( $response );
	}

	public static function update_orders_status() {
		check_ajax_referer( 'ccb_update_orders_status', 'nonce' );

		$response = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$response['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$order_ids = ! empty( $data['order_ids'] ) ? array_map( 'intval', $data['order_ids'] ) : array();
		$status_id = ! empty( $data['status_id'] ) ? (int) $data['status_id'] : null;

		if ( empty( $order_ids ) || empty( $status_id ) ) {
			wp_send_json( $response );
		}

		$status = OrdersStatuses::get_status_by_id( $status_id );
		if ( empty( $status ) ) {
			$response['message'] = __( 'Status not found', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		OrdersPayments::update_payment_status_by_order_ids( $order_ids, $status_id );

		$response['success'] = true;
		$response['status']  = 'success';
		$response['message'] = __( 'Orders status updated successfully', 'cost-calculator-builder' );
		wp_send_json( $response );
	}

	public static function check_action( $payment_method, $calc_id ) {
		if ( ! empty( $calc_id ) && ! empty( $payment_method ) ) {
			$settings = CCBSettingsData::get_calc_single_settings( $calc_id );
			if ( 'no_payments' === $payment_method && ! empty( $settings['formFields']['accessEmail'] ) ) {
				return true;
			} elseif ( 'cash_payment' === $payment_method && ! empty( $settings['payment_gateway']['cash_payment']['enable'] ) ) {
				return true;
			} elseif ( 'paypal' === $payment_method && ! empty( $settings['payment_gateway']['paypal']['enable'] ) ) {
				return true;
			} elseif ( 'stripe' === $payment_method && ! empty( $settings['payment_gateway']['cards']['card_payments']['stripe']['enable'] ) ) {
				return true;
			} elseif ( 'razorpay' === $payment_method && ! empty( $settings['payment_gateway']['cards']['card_payments']['razorpay']['enable'] ) ) {
				return true;
			} elseif ( in_array( $payment_method, array( 'woo_checkout', 'woocommerce' ), true ) && ! empty( $settings['woo_checkout']['enable'] ) ) {
				return true;
			}
		}

		return false;
	}

	public static function send_to_email() {
		check_ajax_referer( 'ccb_send_to_email', 'nonce' );

		$result = array(
			'status'  => 'error',
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$result['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $result );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		$order_id = isset( $data['order_id'] ) ? (int) $data['order_id'] : null;
		$emails   = isset( $data['emails'] ) ? array_map( 'sanitize_email', $data['emails'] ) : array();

		if ( empty( $order_id ) || empty( $emails ) ) {
			wp_send_json( $result );
		}

		$order = CalcOrders::get_order_full_data_by_id( $order_id );
		if ( empty( $order ) ) {
			$result['message'] = __( 'Order not found', 'cost-calculator-builder' );
			wp_send_json( $result );
		}

		$params = array(
			'args'        => $order,
			'calcId'      => $order['calc_id'],
			'attachments' => array(),
		);

		$params['args']['show_unit'] = '';
		$params['args']['orderId']   = (int) $order['order_id'];
		$params['args']['fields']    = $order['calculator_fields'];

		$calc_settings                   = CCBSettingsData::get_calc_single_settings( $order['calc_id'] );
		$params['args']['summary_block'] = $calc_settings['general'];

		$general_settings                 = CCBSettingsData::get_calc_global_settings();
		$params['args']['email_settings'] = $general_settings['email_templates'];

		$params['args']['emails'] = $emails;

		$result = CCBContactForm::sendEmail( $params, $result );

		wp_send_json( $result );
	}

	public static function fetch_pdf_settings() {
		check_ajax_referer( 'ccb_get_pdf_settings', 'nonce' );

		$response = array(
			'success' => false,
			'message' => __( 'Invalid data', 'cost-calculator-builder' ),
			'data'    => array(
				'settings' => null,
			),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			$response['message'] = __( 'You are not allowed to run this action', 'cost-calculator-builder' );
			wp_send_json( $response );
		}

		$general_settings             = CCBSettingsData::get_calc_global_settings();
		$response['success']          = true;
		$response['message']          = __( 'PDF settings fetched successfully', 'cost-calculator-builder' );
		$response['data']['settings'] = ! empty( $general_settings['pdf_manager']['data'] ) ? $general_settings['pdf_manager']['data'] : array();
		wp_send_json( $response );
	}
}
