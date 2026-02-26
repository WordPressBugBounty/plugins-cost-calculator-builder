<?php

namespace cBuilder\Classes;

use cBuilder\Classes\Database\OrdersFormsDetails;
use cBuilder\Classes\Database\OrdersCurrency;
use cBuilder\Classes\Database\OrdersDiscounts;
use cBuilder\Classes\Database\OrdersPayments;
use cBuilder\Classes\Database\OrdersPromocodes;
use cBuilder\Classes\Database\OrdersStatuses;
use cBuilder\Classes\Database\OrdersCalculatorFields;
use cBuilder\Classes\Database\Orders;
use cBuilder\Classes\Database\CalcOrders;
use cBuilder\Classes\Database\OrdersTotals;
use cBuilder\Classes\Database\OrdersCalcFieldsAttrs;
use cBuilder\Classes\Database\OrdersCalcFieldsMultiOptions;
use cBuilder\Classes\Database\OrdersCalcBasicFields;
use cBuilder\Classes\Database\Payments;
use cBuilder\Classes\Database\OrdersNotes;

class OrdersPatch {
	public static function ccb_patch_maybe_create_orders_table() {
		global $wpdb;
		$orders_table = CalcOrders::_table();
		if ( ! $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s;', $orders_table ) ) ) { // phpcs:ignore
			CalcOrders::create_table();
			OrdersStatuses::create_table();
			OrdersPayments::create_table();
			OrdersFormsDetails::create_table();
			OrdersCalculatorFields::create_table();
			OrdersCalcFieldsAttrs::create_table();
			OrdersCalcFieldsMultiOptions::create_table();
			OrdersCalcBasicFields::create_table();
			OrdersCurrency::create_table();
			OrdersDiscounts::create_table();
			OrdersPromocodes::create_table();
			OrdersTotals::create_table();
			OrdersNotes::create_table();
		}
	}

	public static function ccb_patch_maybe_create_orders_statuses() {
		global $wpdb;
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s;', OrdersStatuses::_table() ) ) ) { // phpcs:ignore
			OrdersStatuses::create_default_statuses();
		}
	}

	public static function ccb_patch_maybe_move_orders_data() {
		global $wpdb;
		$orders_table = CalcOrders::_table();
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s;', $orders_table ) ) ) { // phpcs:ignore
			$new_orders_count = CalcOrders::orders_count();
			$old_orders_count = Orders::orders_count();

			if ( empty( $new_orders_count ) && ! empty( $old_orders_count ) ) {
				$batch_size     = 20;
				$offset         = 0;
				$total_migrated = 0;
				$errors_count   = 0;

				while ( $offset < $old_orders_count ) {
					$old_orders = Orders::get_order_full_data_batch( $batch_size, $offset );

					if ( empty( $old_orders ) ) {
						break;
					}

					foreach ( $old_orders as $old_order ) {
						try {
							$order_data = array(
								'calc_id'      => $old_order['calc_id'],
								'total_amount' => isset( $old_order['payment_total'] ) ? $old_order['payment_total'] : 0,
								'calc_title'   => $old_order['calc_title'],
								'old_order_id' => $old_order['order_id'],
							);

							$form_data = array();
							if ( ! empty( $old_order['form_details']['fields'] ) ) {
								$form_data = $old_order['form_details']['fields'];
							}

							$calc_fields = array();
							if ( ! empty( $old_order['order_details'] ) ) {
								foreach ( $old_order['order_details'] as $order_detail ) {
									$calc_fields[] = $order_detail;
								}
							}

							$default_status = OrdersStatuses::get_default_status();

							$old_payment_data = Payments::payment_by_order_id_exist( $old_order['order_id'] );
							$payment_data     = array(
								'order_id'       => $old_order['order_id'],
								'payment_type'   => 'no_payments',
								'payment_status' => $default_status['id'],
								'total'          => 0,
							);

							if ( ! empty( $old_payment_data ) ) {
								$status    = OrdersStatuses::get_status_by_slug( $old_payment_data->status );
								$status_id = $default_status['id'];
								if ( ! empty( $status['id'] ) ) {
									$status_id = $status['id'];
								}

								$total = 0;
								if ( ! empty( $old_order['totals'] ) && is_array( $old_order['totals'] ) ) {
									foreach ( $old_order['totals'] as $t ) {
										if ( isset( $t['total'] ) ) {
											$total += $t['total'];
										}
									}
								}

								$payment_data = array(
									'order_id'       => $old_order['order_id'],
									'payment_type'   => $old_payment_data->type,
									'payment_status' => $status_id,
									'total'          => ! empty( $old_payment_data->total ) ? $old_payment_data->total : $total,
									'tax'            => isset( $old_payment_data->tax ) ? $old_payment_data->tax : 0,
									'transaction'    => isset( $old_payment_data->transaction ) ? $old_payment_data->transaction : '',
									'paid_at'        => isset( $old_payment_data->paid_at ) ? $old_payment_data->paid_at : null,
									'created_at'     => isset( $old_payment_data->created_at ) ? $old_payment_data->created_at : wp_date( 'Y-m-d H:i:s' ),
								);
							}

							$data = array(
								'order_data'        => $order_data,
								'form_details'      => $form_data,
								'calculator_fields' => $calc_fields,
								'currency'          => isset( $old_order['order_currency'] ) ? $old_order['order_currency'] : array(),
								'discounts'         => isset( $old_order['discounts'] ) ? $old_order['discounts'] : array(),
								'promocodes'        => isset( $old_order['promocodes'] ) ? $old_order['promocodes'] : array(),
								'totals'            => isset( $old_order['totals'] ) ? $old_order['totals'] : array(),
								'other_totals'      => isset( $old_order['other_totals'] ) ? $old_order['other_totals'] : array(),
								'payment_details'   => $payment_data,
								'created_at'        => isset( $old_order['created_at'] ) ? $old_order['created_at'] : wp_date( 'Y-m-d H:i:s' ),
							);

							CalcOrders::create_order( $data );
							$total_migrated++;

							unset( $order_data, $form_data, $calc_fields, $payment_data, $data, $old_payment_data, $default_status );

						} catch ( \Exception $e ) {
							$errors_count++;
							error_log( 'CCB Migration Error for order ' . $old_order['order_id'] . ': ' . $e->getMessage() ); // phpcs:ignore
						}
					}

					unset( $old_orders );

					global $wpdb;
					if ( isset( $wpdb->queries ) ) {
						$wpdb->queries = array();
					}
					$wpdb->flush();

					if ( function_exists( 'gc_collect_cycles' ) ) {
						gc_collect_cycles();
					}

					$offset += $batch_size;

					usleep( 200000 );
				}

				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					// phpcs:disable
					error_log( sprintf( 
						'CCB Orders Migration Complete: %d migrated, %d errors out of %d total', 
						$total_migrated, 
						$errors_count, 
						$old_orders_count 
					) );
					// phpcs:enable
				}

				if ( function_exists( 'wp_cache_flush' ) ) {
					wp_cache_flush();
				}

				global $wpdb;
				if ( isset( $wpdb->queries ) ) {
					$wpdb->queries = array();
				}
				$wpdb->flush();

				if ( function_exists( 'gc_collect_cycles' ) ) {
					gc_collect_cycles();
				}
			}
		}
	}

	public static function ccb_patch_maybe_fill_single_option_field() {
		global $wpdb;
		$orders_table = CalcOrders::_table();
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s;', $orders_table ) ) ) { // phpcs:ignore
			$new_orders_count = CalcOrders::orders_count();
			$old_orders_count = Orders::orders_count();

			if ( ! empty( $new_orders_count ) && ! empty( $old_orders_count ) ) {
				$batch_size     = 20;
				$offset         = 0;
				$total_migrated = 0;
				$errors_count   = 0;

				while ( $offset < $old_orders_count ) {
					$old_orders = Orders::get_order_full_data_batch( $batch_size, $offset );

					if ( empty( $old_orders ) ) {
						break;
					}

					foreach ( $old_orders as $old_order ) {
						try {
							$order_data = array(
								'calc_id' => $old_order['calc_id'],
							);

							$calc_fields = array();
							if ( ! empty( $old_order['order_details'] ) ) {
								foreach ( $old_order['order_details'] as $order_detail ) {
									if ( ! empty( $order_detail['alias'] ) ) {
										$field_name = preg_replace( '/_field_id.*/', '', $order_detail['alias'] );
										if ( in_array( $field_name, array( 'dropDown', 'dropDown_with_img', 'radio_with_img', 'radio' ), true ) ) {
											$temp = array();
											if ( ! empty( $order_detail['temps'] ) ) {
												$temp = $order_detail['temps'];
											}

											if ( empty( $temp ) && ! empty( $order_detail['options'] ) && 1 === count( $order_detail['options'] ) && ! empty( $order_detail['summary_value'] ) ) {
												if ( strval( $order_detail['summary_value'] ) === strval( $order_detail['options'][0]['value'] ) || strval( $order_detail['summary_value'] ) === strval( $order_detail['options'][0]['label'] ) ) {
													$temp = $order_detail['options'][0]['optionValue'];
												}
											}

											$calc_fields[] = array(
												'alias'         => $order_detail['alias'], //phpcs:ignore
												'single_option' => $temp,
											);
										}
									}
								}
							}

							$new_order_id = CalcOrders::get_new_order_id_by_old_order_id( $old_order['order_id'] );
							$fields       = OrdersCalculatorFields::get_calculator_fields_by_order_id( $new_order_id );

							if ( ! empty( $fields ) ) {
								foreach ( $fields as $field ) {
									if ( ! empty( $field['alias'] ) ) {
										foreach ( $calc_fields as $calc_field ) {
											if ( ! empty( $calc_field['alias'] ) && ! empty( $field['alias'] ) && $calc_field['alias'] === $field['alias'] ) {
												if ( ! empty( $calc_field['single_option'] ) ) {
													$value = $calc_field['single_option'];
													if ( is_array( $value ) ) {
														$value = $value[0];
													}

													OrdersCalcFieldsAttrs::update_single_option( $field['id'], $value );
												}
											}
										}
									}
								}
							}

							$total_migrated++;

							unset( $order_data, $calc_fields, $new_order_id, $fields );

						} catch ( \Exception $e ) {
							$errors_count++;
							error_log( 'CCB Migration Error for order ' . $old_order['order_id'] . ': ' . $e->getMessage() ); // phpcs:ignore
						}
					}

					unset( $old_orders );

					global $wpdb;
					if ( isset( $wpdb->queries ) ) {
						$wpdb->queries = array();
					}
					$wpdb->flush();

					if ( function_exists( 'gc_collect_cycles' ) ) {
						gc_collect_cycles();
					}

					$offset += $batch_size;

					usleep( 200000 );
				}

				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					// phpcs:disable
					error_log( sprintf( 
						'CCB Orders Migration Complete: %d migrated, %d errors out of %d total', 
						$total_migrated, 
						$errors_count, 
						$old_orders_count 
					) );
					// phpcs:enable
				}

				if ( function_exists( 'wp_cache_flush' ) ) {
					wp_cache_flush();
				}

				global $wpdb;
				if ( isset( $wpdb->queries ) ) {
					$wpdb->queries = array();
				}
				$wpdb->flush();

				if ( function_exists( 'gc_collect_cycles' ) ) {
					gc_collect_cycles();
				}
			}
		}
	}

	public static function ccb_maybe_move_orders_payment_data() {
		global $wpdb;
		$orders_table         = CalcOrders::_table();
		$orders_payment_table = OrdersPayments::_table();
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s;', $orders_table ) ) && $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s;', $orders_payment_table ) ) ) { // phpcs:ignore
			$new_orders_count = CalcOrders::orders_count( null, null, array( 'o.old_order_id is not null' ) );
			$payments_count   = OrdersPayments::get_count();

			if ( empty( $payments_count ) && ! empty( $new_orders_count ) ) {
				$batch_size     = 20;
				$offset         = 0;
				$total_migrated = 0;
				$errors_count   = 0;

				while ( $offset < $new_orders_count ) {
					$old_orders = Orders::get_order_full_data_batch( $batch_size, $offset );

					if ( empty( $old_orders ) ) {
						break;
					}

					foreach ( $old_orders as $old_order ) {
						try {
							$default_status   = OrdersStatuses::get_default_status();
							$old_payment_data = Payments::payment_by_order_id_exist( $old_order['order_id'] );
							$payment_data     = array(
								'order_id'       => $old_order['order_id'],
								'payment_type'   => 'no_payments',
								'payment_status' => $default_status['id'],
								'total'          => 0,
							);

							if ( ! empty( $old_payment_data ) ) {
								$status    = OrdersStatuses::get_status_by_slug( $old_payment_data->status );
								$status_id = $default_status['id'];
								if ( ! empty( $status['id'] ) ) {
									$status_id = $status['id'];
								}

								$total = 0;
								if ( ! empty( $old_order['totals'] ) && is_array( $old_order['totals'] ) ) {
									foreach ( $old_order['totals'] as $t ) {
										if ( isset( $t['total'] ) ) {
											$total += $t['total'];
										}
									}
								}

								$payment_data = array(
									'order_id'       => $old_order['order_id'],
									'payment_type'   => $old_payment_data->type,
									'payment_status' => $status_id,
									'total'          => ! empty( $old_payment_data->total ) ? $old_payment_data->total : $total,
									'tax'            => isset( $old_payment_data->tax ) ? $old_payment_data->tax : 0,
									'transaction'    => isset( $old_payment_data->transaction ) ? $old_payment_data->transaction : '',
									'paid_at'        => isset( $old_payment_data->paid_at ) ? $old_payment_data->paid_at : null,
									'created_at'     => isset( $old_payment_data->created_at ) ? $old_payment_data->created_at : wp_date( 'Y-m-d H:i:s' ),
								);

								if ( ! empty( $payment_data['created_at'] ) ) {
									$payment_data['created_at'] = wp_date( 'Y-m-d H:i:s', strtotime( $payment_data['created_at'] ) );
								}

								OrdersPayments::create_payment( $old_order['order_id'], $payment_data );
							}

							$total_migrated++;

							unset( $payment_data, $data, $old_payment_data, $default_status );

						} catch ( \Exception $e ) {
							$errors_count++;
							error_log( 'CCB Migration Error for payment ' . $old_order['order_id'] . ': ' . $e->getMessage() ); // phpcs:ignore
						}
					}

					unset( $old_orders );

					global $wpdb;
					if ( isset( $wpdb->queries ) ) {
						$wpdb->queries = array();
					}
					$wpdb->flush();

					if ( function_exists( 'gc_collect_cycles' ) ) {
						gc_collect_cycles();
					}

					$offset += $batch_size;

					usleep( 200000 );
				}

				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					// phpcs:disable
					error_log( sprintf(
						'CCB Orders Migration Complete: %d migrated, %d errors',
						$total_migrated,
						$errors_count
					) );
					// phpcs:enable
				}

				if ( function_exists( 'wp_cache_flush' ) ) {
					wp_cache_flush();
				}

				global $wpdb;
				if ( isset( $wpdb->queries ) ) {
					$wpdb->queries = array();
				}
				$wpdb->flush();

				if ( function_exists( 'gc_collect_cycles' ) ) {
					gc_collect_cycles();
				}
			}
		}
	}

	public static function ccb_patch_maybe_fill_parent_alias_field() {
		global $wpdb;
		$attrs_table       = OrdersCalcFieldsAttrs::_table();
		$fields_table      = OrdersCalculatorFields::_table();
		$calc_orders_table = CalcOrders::_table();

		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s;', $attrs_table ) ) ) { // phpcs:ignore
			// phpcs:disable
			$query = $wpdb->prepare(
				"
				SELECT
					o.calc_id,
					fa.*
				FROM {$calc_orders_table} o
				LEFT JOIN {$fields_table} cf ON o.id = cf.order_id
				LEFT JOIN {$attrs_table} fa ON cf.id = fa.field_id
				WHERE fa.parent_alias IS NULL
				ORDER BY o.calc_id, fa.field_id
				",
			);
			// phpcs:enable

			$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore

			$calc_fields     = null;
			$updated_fields  = array();
			$current_calc_id = null;
			foreach ( $results as $result ) {
				if ( empty( $current_calc_id ) ) {
					$current_calc_id = intval( $result['calc_id'] );
				}

				if ( intval( $result['calc_id'] ) !== intval( $current_calc_id ) ) {
					$current_calc_id = intval( $result['calc_id'] );
					unset( $calc_fields );
				}

				if ( empty( $calc_fields ) ) {
					$calc_fields = get_post_meta( $result['calc_id'], 'stm-fields', true );
					$calc_fields = self::parse_calc_fields( $calc_fields );
				}

				$result['alias'] = self::normalize_alias( $result['alias'] );
				if ( ! empty( $calc_fields[ $result['alias'] ] ) && ! empty( $calc_fields[ $result['alias'] ]['groupId'] ) && strpos( $calc_fields[ $result['alias'] ]['groupId'], 'repeater' ) !== false ) {
					$updated_fields[] = array(
						'field_id'     => $result['field_id'],
						'parent_alias' => $calc_fields[ $result['alias'] ]['groupId'],
					);
				}
			}

			if ( ! empty( $updated_fields ) ) {
				foreach ( $updated_fields as $updated_field ) {
					OrdersCalcFieldsAttrs::update_parent_alias( $updated_field['field_id'], $updated_field['parent_alias'] );
				}
			}
		}
	}

	private static function parse_calc_fields( $calc_fields ) {
		$fields = array();

		foreach ( $calc_fields as $field ) {
			if ( strpos( $field['alias'], 'page' ) !== false && ! empty( $field['groupElements'] ) ) {
				foreach ( $field['groupElements'] as $group_element ) {
					if ( strpos( $group_element['alias'], 'section' ) !== false && ! empty( $group_element['fields'] ) ) {
						$fields = array_merge( $fields, $group_element['fields'] );
					}
				}
			}
		}

		if ( ! empty( $fields ) ) {
			$temp_fields = array();
			foreach ( $fields as $field ) {
				if ( strpos( $field['alias'], 'group' ) !== false ) {
					continue;
				}

				if ( strpos( $field['alias'], 'repeater' ) !== false && ! empty( $field['groupElements'] ) ) {
					$temp_fields = array_merge( $temp_fields, $field['groupElements'] );
					continue;
				}

				$temp_fields[] = $field;
			}

			$fields      = $temp_fields;
			$temp_fields = array();

			foreach ( $fields as $field ) {
				if ( ! empty( $field['alias'] ) ) {
					$temp_fields[ $field['alias'] ] = $field;
				}
			}

			$fields = $temp_fields;
			unset( $temp_fields );
		}

		return $fields;
	}

	private static function normalize_alias( $alias ) {
		if ( ! empty( $alias ) ) {
			return preg_replace( '/^(.*_\d+)_\d+$/', '$1', $alias );
		}

		return $alias;
	}

	public static function ccb_patch_maybe_fill_before_discount_value_to_orders_discounts() {
		$discounts = OrdersDiscounts::get_discounts();
		if ( ! empty( $discounts ) ) {
			foreach ( $discounts as $discount ) {
				$field_id    = $discount['field_id'];
				$total_field = OrdersTotals::get_totals_field_by_id( $field_id );
				if ( ! empty( $total_field ) && ! empty( $discount['discount_type'] ) ) {
					$total_amount = $total_field['value'];
					if ( 'percent_of_amount' === $discount['discount_type'] ) {
						$total_amount = $total_amount / ( 1 - $discount['discount_amount'] / 100 );
					} elseif ( 'fixed_amount' === $discount['discount_type'] ) {
						$total_amount = $total_amount + $discount['discount_amount'];
					}
					OrdersDiscounts::fill_before_discount_value( $discount['id'], $total_amount );
				}
			}
		}
	}
}
