<?php

namespace cBuilder\Classes;

use cBuilder\Helpers\CCBFieldsHelper;
use cBuilder\Helpers\CCBOrderFormFieldsHelper;
use cBuilder\Classes\Database\FormFields;
use cBuilder\Classes\Database\Forms;
use cBuilder\Classes\Appearance\CCBAppearanceHelper;
use cBuilder\Classes\Appearance\Presets\CCBPresetGenerator;

class CCBCalculatorsHandler {
	public static function ccb_fetch_calculators() {
		check_ajax_referer( 'ccb_fetch_calculators', 'nonce' );

		$result = array(
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $result );
		}

		$result['success'] = true;
		$result['message'] = __( 'Calculators fetched successfully', 'cost-calculator-builder' );
		$result['data']    = array(
			'calculators' => self::get_calculators(),
			'total'       => self::get_total(),
		);

		wp_send_json( $result );
	}

	public static function ccb_fetch_templates() {
		check_ajax_referer( 'ccb_fetch_templates', 'nonce' );

		$result = array(
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $result );
		}

		$result['success'] = true;
		$result['message'] = __( 'Templates fetched successfully', 'cost-calculator-builder' );
		$result['data']    = array(
			'templates'   => self::get_templates(),
			'categories'  => self::get_categories(),
			'favorites'   => self::get_favorites(),
			'admin_email' => self::get_admin_email(),
			'pro_active'  => self::get_pro_active(),
			'unlock'      => self::get_unlock(),
		);

		wp_send_json( $result );
	}


	public static function create_calc_id() {
		check_ajax_referer( 'ccb_create_id', 'nonce' );

		$result = array(
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $result );
		}

		// create cost-calc post and get id
		$id = wp_insert_post(
			array(
				'post_type'   => 'cost-calc',
				'post_status' => 'draft',
			)
		);

		$data = array(
			'id'  => $id,
			'url' => 'page=cost_calculator_builder&action=edit&id=' . $id,
		);

		$result['success'] = true;
		$result['message'] = __( 'Calculator created successfully', 'cost-calculator-builder' );
		$result['data']    = $data;

		wp_send_json( $result );
	}

	public static function edit_calc() {
		check_ajax_referer( 'ccb_edit_calc', 'nonce' );

		$result = array(
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $result );
		}

		$id = isset( $_GET['id'] ) ? $_GET['id'] : 0;

		if ( empty( $id ) ) {
			$result['message'] = __( 'Invalid input', 'cost-calculator-builder' );
			wp_send_json( $result );
		}

		$result['success'] = true;
		$result['message'] = __( 'Calculator edited successfully', 'cost-calculator-builder' );
		$result['data']    = array(
			'url' => 'page=cost_calculator_builder&action=edit&id=' . $id,
		);

		wp_send_json( $result );
	}

	public static function use_template() {
		check_ajax_referer( 'ccb_use_template', 'nonce' );

		$result = array(
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $result );
		}

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );
		$template_id  = ! isset( $data['template_id'] ) ? null : $data['template_id'];

		$result = array(
			'success' => false,
			'message' => __( 'Could not duplicate calculator, please try again!', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! is_null( $template_id ) ) {
			$calc_id  = get_post_meta( $template_id, 'calc_id', true );
			$category = get_post_meta( $template_id, 'category', true );
			$data     = CCBCalculators::duplicate_target_calc( $calc_id, false );

			if ( 'custom_templates' !== $category ) {
				$data['preset_idx'] = 'default';
			}

			if ( ccb_update_calc_values( $data ) ) {
				$result['success'] = true;
				$result['message'] = __( 'Calculator created successfully', 'cost-calculator-builder' );
				$result['data']    = array(
					'id' => $data['id'],
				);
			}
		}

		wp_send_json( $result );
	}

	public static function run_calc_updates() {
		check_ajax_referer( 'ccb_run_calc_updates', 'nonce' );

		$result = array(
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $result );
		}

		$updates = CCBUpdates::get_updates();

		$data = $_POST;
		if ( empty( $_POST ) ) {
			$request_body = file_get_contents( 'php://input' );
			$request_data = json_decode( $request_body, true );
			$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );
		}

		if ( current_user_can( 'manage_options' ) && 'calc_run_updates' === $data['action'] && ! empty( $data['access'] ) ) {
			foreach ( $updates as $callback_arr ) {
				foreach ( $callback_arr as $callback ) {
					call_user_func( array( '\\cBuilder\\Classes\\CCBUpdatesCallbacks', $callback ) );
				}
			}
		}

		$result['success'] = true;
		$result['message'] = __( 'Calculators updated successfully', 'cost-calculator-builder' );
		$result['data']    = array();

		wp_send_json( $result );
	}

	public static function delete_calc() {
		check_ajax_referer( 'ccb_delete_calc', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to run this action', 'cost-calculator-builder' ) );
		}

		$result = array(
			'success' => false,
			'message' => __( 'Could not delete calculator, please try again!', 'cost-calculator-builder' ),
		);

		if ( isset( $_GET['ids'] ) ) {
			$ids = array_map(
				function ( $item ) {
					return (int) sanitize_text_field( $item );
				},
				explode( ',', $_GET['ids'] )
			);

			foreach ( $ids as $id ) {
				wp_delete_post( $id );
				clearMetaData( $id );
				ccb_update_woocommerce_calcs( $id, true );
			}

			$result['success'] = true;
			$result['message'] = __( 'Calculators deleted successfully', 'cost-calculator-builder' );
		}

		wp_send_json( $result );
	}

	public static function duplicate_calc() {

		check_ajax_referer( 'ccb_duplicate_calc', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to run this action', 'cost-calculator-builder' ) );
		}

		$result = array(
			'success' => false,
			'message' => __( "Couldn't duplicate calculator, please try again!', 'cost-calculator-builder" ),
		);

		if ( isset( $_GET['ids'] ) ) {

			$ids = array_map(
				function ( $item ) {
					return (int) sanitize_text_field( $item );
				},
				explode( ',', $_GET['ids'] )
			);

			foreach ( $ids as $id ) {
				$new_calculator = array(
					'post_parent' => $id,
					'post_status' => 'publish',
					'post_type'   => 'cost-calc',
				);

				$duplicated_post_id = wp_insert_post( $new_calculator );

				$data = array(
					'id'         => $duplicated_post_id,
					'title'      => CCBCalculators::get_calculator_name_for_duplicate( $id ),
					'formula'    => get_post_meta( $id, 'stm-formula', true ),
					'settings'   => CCBSettingsData::get_calc_single_settings( $id ),
					'builder'    => get_post_meta( $id, 'stm-fields', true ),
					'conditions' => get_post_meta( $id, 'stm-conditions', true ),
					'appearance' => get_post_meta( $id, 'ccb-appearance', true ),
					'preset_idx' => get_post_meta( $id, 'ccb_calc_preset_idx', true ),
				);

				if ( ccb_update_calc_values( $data ) ) {
					$result['success'] = true;
					$result['message'] = __( 'Calculator duplicated successfully', 'cost-calculator-builder' );
				} else {
					$result['success'] = false;
					$result['message'] = __( 'Could not duplicate calculator, please try again!', 'cost-calculator-builder' );
				}
			}
		}

		wp_send_json( $result );
	}

	public static function get_calculator_admin_data() {
		check_ajax_referer( 'ccb_get_calculator_admin_data', 'nonce' );

		$result = array(
			'success' => false,
			'message' => __( 'You are not allowed to run this action', 'cost-calculator-builder' ),
			'data'    => array(),
		);

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json( $result );
		}

		$calc_id = isset( $_GET['calc_id'] ) ? $_GET['calc_id'] : 0;

		if ( empty( $calc_id ) ) {
			$result['message'] = __( 'Invalid input', 'cost-calculator-builder' );
			wp_send_json( $result );
		}

		$result['success'] = true;
		$result['message'] = __( 'Calculator admin data fetched successfully', 'cost-calculator-builder' );
		$result['data']    = self::parse_calc_data( $calc_id );

		wp_send_json( $result );
	}

	public static function save_settings() {
		check_ajax_referer( 'ccb_save_settings', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to run this action', 'cost-calculator-builder' ) );
		}

		$result = array(
			'success' => false,
			'message' => 'Something went wrong',
		);

		$request_body = file_get_contents( 'php://input' );
		$request_data = json_decode( $request_body, true );
		$data         = apply_filters( 'stm_ccb_sanitize_array', $request_data );

		if ( isset( $data['settings']['formFields']['body'] ) ) {
			$content                                = $data['settings']['formFields']['body'];
			$content                                = str_replace( '\\n', '<br>', $content );
			$data['settings']['formFields']['body'] = str_replace( '\\', '', $content );
		}

		if ( ! empty( $data ) && ccb_update_calc_values( $data ) ) {
			$general_settings = CCBSettingsData::get_calc_global_settings();
			if ( isset( $general_settings['backup_settings'] ) && true === filter_var( $general_settings['backup_settings']['auto_backup'], FILTER_VALIDATE_BOOLEAN ) ) {
				CCBCalculators::savepoint( $data );
			}

			$params['calc_id'] = ! empty( $data['id'] ) ? sanitize_text_field( $data['id'] ) : '';
			$calc_data         = CCBCalculators::edit_calc_body( $params );
			$total_summary     = get_post_meta( intval( $data['id'] ), 'stm-total-summary', true );

			$result['success'] = true;
			$result['message'] = 'Calculator updated successfully';
			$result['data']    = array(
				'settings'      => $calc_data['settings'],
				'total_summary' => ! empty( $total_summary ) ? $total_summary : CCBSettingsData::total_summary_settings_data( $calc_data['settings']['general'] ?? array() ),
			);
		}

		wp_send_json( $result );
	}

	private static function get_calculators() {
		global $wpdb;

		$limit     = isset( $_GET['limit'] ) ? $_GET['limit'] : 10;
		$page      = isset( $_GET['page'] ) ? $_GET['page'] : 1;
		$sortBy    = isset( $_GET['sort_by'] ) ? $_GET['sort_by'] : 'id';
		$direction = isset( $_GET['direction'] ) ? $_GET['direction'] : 'desc';
		$offset    = 1 === $page ? 0 : ( $page - 1 ) * $limit;

		// phpcs:disable
		$query = $wpdb->prepare(
			"SELECT ID as id, post_date as created_at, post_title as title, post_title as title FROM {$wpdb->posts} WHERE post_type = 'cost-calc' AND post_status = 'publish' ORDER BY {$sortBy} {$direction} LIMIT %d OFFSET %d",
			$limit,
			$offset
		);
		// phpcs:enable

		$calculators = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore

		foreach ( $calculators as $key => $calculator ) {
			$calculators[ $key ]['icon']  = self::get_calculator_icon( $calculator['id'] );
			$calculators[ $key ]['image'] = self::get_calculator_image( $calculator['id'] );
		}

		return $calculators;
	}

	private static function get_calculator_icon( $id ) {
		$source = get_post_meta( $id, 'ccb_icon', true );
		if ( ! empty( $source ) ) {
			return $source;
		}

		$avatar_index = random_int( 0, 9 );
		$avatar_name  = 0 === $avatar_index ? 'avatar.png' : 'avatar_' . $avatar_index . '.png';

		return CALC_URL . '/frontend/vue3/assets/images/avatars/' . $avatar_name;
	}

	private static function get_calculator_image( $id ) {
		$source = get_post_meta( $id, 'ccb_image', true );
		if ( ! empty( $source ) ) {
			return $source;
		}

		return CALC_URL . '/frontend/vue3/assets/images/calc-preview.png';
	}

	private static function get_templates() {
		$templates = CCBCalculatorTemplates::calc_templates_list();
		if ( is_array( $templates ) ) {
			return $templates;
		}

		return array();
	}

	private static function get_categories() {
		$categories = CCBCategory::calc_categories_list();
		if ( is_array( $categories ) ) {

			$data      = array();
			$templates = self::get_templates();

			foreach ( $templates as $template ) {
				if ( ! isset( $data[ $template['category'] ] ) ) {
					$data[ $template['category'] ] = 0;
				}

				$data[ $template['category'] ]++;
			}

			foreach ( $categories as $key => $category ) {
				$categories[ $key ]['count'] = isset( $data[ $category['slug'] ] ) ? $data[ $category['slug'] ] : 0;
			}

			return $categories;
		}

		return array();
	}

	private static function get_favorites() {
		return array_values( get_option( 'calc_templates_favorites', array() ) );
	}

	private static function get_admin_email() {
		return get_option( 'ccb_lock_templates_email' );
	}

	private static function get_pro_active() {
		return defined( 'CCB_PRO_VERSION' );
	}

	private static function get_unlock() {
		return get_option( 'ccb_lock_templates', false );
	}

	private static function get_total() {
		global $wpdb;
		return $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'cost-calc' AND post_status = 'publish'" );
	}

	private static function get_filter_data( $data ) {
		$sort_by   = ! empty( $data['sortBy'] ) ? sanitize_text_field( $data['sortBy'] ) : 'id';
		$direction = ! empty( $data['direction'] ) ? sanitize_text_field( $data['direction'] ) : 'desc';
		$page      = ! empty( $data['page'] ) ? (int) sanitize_text_field( $data['page'] ) : 1;
		$limit     = ! empty( $data['limit'] ) ? sanitize_text_field( $data['limit'] ) : 5;
		$search    = ! empty( $data['search'] ) ? sanitize_text_field( $data['search'] ) : '';
		$offset    = 1 === $page ? 0 : ( $page - 1 ) * $limit;
		$direction = 'desc' === strtolower( $direction ) ? $direction : 'asc';

		return array(
			'page'      => $page,
			'limit'     => $limit,
			'offset'    => $offset,
			'sort_by'   => $sort_by,
			'direction' => $direction,
			'search'    => $search,
		);
	}

	private static function parse_calc_data( $calc_id ) {
		$result = CCBCalculators::get_default_calculator_data();

		if ( ! empty( $calc_id ) ) {
			$stm_fields = get_post_meta( $calc_id, 'stm-fields', true );

			$result['calculator_builder'] = array(
				'id'      => $calc_id,
				'title'   => get_post_meta( $calc_id, 'stm-name', true ),
				'formula' => get_post_meta( $calc_id, 'stm-formula', true ),
				'builder' => ! empty( $stm_fields ) ? $stm_fields : array(),
				'fields'  => CCBFieldsHelper::fields(),
			);
			$result['saved']              = (bool) get_post_meta( $calc_id, 'calc_saved', true );

			$all_forms = Forms::get_all_forms();
			if ( empty( $all_forms ) ) {
				Forms::create_default_form_for_calculator( $calc_id );
				$all_forms = Forms::get_all_forms();
			}

			$active_form_id = CCBOrderFormFieldsHelper::get_active_form_id( $calc_id );
			if ( empty( $active_form_id ) && ! empty( $all_forms ) ) {
				$active_form_id = $all_forms[0]['id'];
				update_post_meta( $calc_id, 'form_id', $active_form_id );
			}

			if ( ccb_pro_active() ) {
				$result['order_form_manager'] = array(
					'order_form_fields'        => CCBOrderFormFieldsHelper::order_form_fields(),
					'active_form_id'           => $active_form_id,
					'order_forms'              => $all_forms,
					'order_active_form_fields' => FormFields::get_active_fields( intval( $active_form_id ) ),
				);

				$result['payments'] = \cBuilder\Classes\CCBProSettings::get_payments();

				$conditions           = get_post_meta( $calc_id, 'stm-conditions', true );
				$result['conditions'] = array(
					'nodes'  => $conditions['nodes_v4'] ?? array(),
					'links'  => $conditions['links_v4'] ?? array(),
					'spaces' => $conditions['spaces'] ?? array(),
				);
			} else {
				$result['conditions'] = array(
					'nodes'  => array(),
					'links'  => array(),
					'spaces' => array(),
				);

				$result['order_form_manager'] = array(
					'order_form_fields'        => array(),
					'active_form_id'           => null,
					'order_forms'              => array(),
					'order_active_form_fields' => array(),
				);
			}

			$settings = self::get_calc_settings_and_general_settings( $calc_id );
			if ( ! empty( $settings['settings'] ) ) {
				$result['settings'] = $settings['settings'];
			}

			if ( ! empty( $settings['general_settings'] ) ) {
				$result['general_settings'] = $settings['general_settings'];
			}

			$result['total_summary'] = self::get_total_summary( $calc_id, $result['settings'] );

			$result['appearance'] = self::get_appearance_response_data( $calc_id );
		}

		$result['contact_forms'] = ccb_contact_forms();

		return $result;
	}

	private static function get_appearance_response_data( $calc_id ) {
		$preset_key = get_post_meta( $calc_id, 'ccb_calc_preset_idx', true );
		$preset_key = empty( $preset_key ) ? 'default' : $preset_key;
		$appearance = CCBAppearanceHelper::get_appearance_data( $preset_key );

		if ( empty( $appearance ) ) {
			return array(
				'presets'             => array(),
				'active_preset'       => array(),
				'selected_preset_key' => 'default',
			);
		}

		$preset_keys = array();
		if ( ! empty( $appearance['list'] ) && is_array( $appearance['list'] ) ) {
			foreach ( $appearance['list'] as $item ) {
				if ( isset( $item['key'] ) ) {
					$preset_keys[] = $item['key'];
				}
			}
		}

		if ( ! in_array( $preset_key, $preset_keys, true ) ) {
			$preset_key = 'default';
			CCBPresetGenerator::update_preset_key( $calc_id, $preset_key );
			$appearance = CCBAppearanceHelper::get_appearance_data( $preset_key );
		}

		$active_preset = isset( $appearance['data'] ) && is_array( $appearance['data'] ) ? $appearance['data'] : array();
		if ( ! isset( $active_preset['preset_key'] ) ) {
			$active_preset['preset_key'] = $preset_key;
		}

		return array(
			'presets'             => self::normalize_appearance_presets( $appearance['list'] ?? array() ),
			'active_preset'       => $active_preset,
			'selected_preset_key' => $preset_key,
		);
	}

	private static function normalize_appearance_presets( $presets ) {
		if ( ! is_array( $presets ) ) {
			return array();
		}

		$result = array();

		foreach ( $presets as $preset ) {
			$preset_id = isset( $preset['key'] ) ? $preset['key'] : '';
			if ( empty( $preset_id ) ) {
				continue;
			}

			$preset_appearance = CCBAppearanceHelper::get_appearance_data( $preset_id );
			$appearance_data   = isset( $preset_appearance['data'] ) && is_array( $preset_appearance['data'] ) ? $preset_appearance['data'] : array();

			$result[] = array(
				'id'     => $preset_id,
				'name'   => isset( $preset['title'] ) ? $preset['title'] : '',
				'colors' => self::extract_preset_colors( $appearance_data ),
			);
		}

		return $result;
	}

	private static function extract_preset_colors( $appearance_data ) {
		$color_keys = array( 'container', 'primary_color', 'accent_color', 'secondary_color', 'error_color' );
		$result     = array();

		foreach ( $color_keys as $key ) {
			$value = '';

			if ( isset( $appearance_data['desktop']['colors']['data'][ $key ]['value'] ) ) {
				$value = $appearance_data['desktop']['colors']['data'][ $key ]['value'];
			} elseif ( isset( $appearance_data['desktop']['colors'][ $key ] ) ) {
				$value = $appearance_data['desktop']['colors'][ $key ];
			}

			if ( is_array( $value ) && isset( $value['color'] ) ) {
				$value = $value['color'];
			}

			$result[] = $value;
		}

		return $result;
	}

	private static function get_calc_settings_and_general_settings( $calc_id ) {
		$result = array(
			'settings'         => array(),
			'general_settings' => array(),
		);

		$general_settings = CCBSettingsData::get_calc_global_settings();
		$positions_keys   = array( 'top_left', 'center_left', 'bottom_left', 'top_center', 'bottom_center', 'top_right', 'center_right', 'bottom_right' );
		$positions        = array();

		foreach ( $positions_keys as $key ) {
			$positions[ $key ] = array(
				'count'  => 0,
				'titles' => array(),
				'ids'    => array(),
			);
		}

		$calculators = CCBUpdatesCallbacks::get_calculators();

		foreach ( array_reverse( $calculators ) as $calculator ) {
			$calc_settings = CCBSettingsData::get_calc_single_settings( $calculator->ID );
			if ( isset( $calc_settings['sticky_calc'] ) && $calc_settings['sticky_calc']['enable'] && 'btn' === $calc_settings['sticky_calc']['display_type'] ) {
				$position_type = $calc_settings['sticky_calc']['btn_position'];

				if ( isset( $positions[ $position_type ]['count'] ) && $positions[ $position_type ]['count'] < 2 ) {
					$title = get_post_meta( $calculator->ID, 'stm-name', true );

					$positions[ $position_type ]['count']++;
					$positions[ $position_type ]['titles'][] = $title;
					$positions[ $position_type ]['ids'][]    = $calculator->ID;
				}
			}

			if ( isset( $calc_settings['sticky_calc'] ) && ! $calc_settings['sticky_calc']['enable'] && 'banner' === $calc_settings['sticky_calc']['display_type'] ) {
				$general_settings['sticky']['used_banner'] = null;
			}
		}

		if ( ! isset( $general_settings['sticky'] ) ) {
			$general_settings['sticky'] = array(
				'positions' => $positions,
			);
		} else {
			$general_settings['sticky']['positions'] = $positions;
		}

		$result['general_settings'] = $general_settings;

		$settings = CCBSettingsData::get_calc_single_settings( $calc_id );

		if ( isset( $settings[0]['general'] ) ) {
			$settings = $settings[0];
		}

		if ( ! empty( $settings ) ) {
			$result['settings'] = $settings;
		}

		if ( ! is_array( $result['settings'] ) || empty( $result['settings']['general'] ) ) {
			$result['settings'] = CCBSettingsData::settings_data();
		}

		if ( ! empty( $result['settings']['formFields']['body'] ) ) {
			$result['settings']['formFields']['body'] = str_replace( '<br>', PHP_EOL, $result['settings']['formFields']['body'] );
		}

		$general_settings   = CCBSettingsData::get_calc_global_settings();
		$ccb_sync           = ccb_sync_settings_from_general_settings( $result['settings'], $general_settings );
		$result['settings'] = $ccb_sync['settings'];

		return $result;
	}

	public static function get_total_summary( $calc_id, $settings ) {
		$total_summary = get_post_meta( $calc_id, 'stm-total-summary', true );
		if ( empty( $total_summary ) || ! is_array( $total_summary ) ) {
			$general       = isset( $settings['general'] ) && is_array( $settings['general'] ) ? $settings['general'] : array();
			$total_summary = CCBSettingsData::total_summary_settings_data( $general );
		}

		$total_summary = self::normalize_total_summary( $total_summary );
		update_post_meta( $calc_id, 'stm-total-summary', apply_filters( 'stm_ccb_sanitize_array', $total_summary ) );

		return $total_summary;
	}

	private static function normalize_total_summary( $total_summary ) {
		if ( empty( $total_summary['arrangement_sections'] ) || ! is_array( $total_summary['arrangement_sections'] ) ) {
			return $total_summary;
		}

		$has_coupons_item = false;

		foreach ( $total_summary['arrangement_sections'] as $section_idx => $section ) {
			$items = isset( $section['items'] ) && is_array( $section['items'] ) ? $section['items'] : array();

			foreach ( $items as $item ) {
				if ( isset( $item['alias'] ) && 'coupons' === $item['alias'] ) {
					$has_coupons_item = true;
				}
			}
		}

		if ( ! $has_coupons_item && ! empty( $total_summary['arrangement_sections'] ) ) {
			if ( ! isset( $total_summary['arrangement_sections'][0]['items'] ) || ! is_array( $total_summary['arrangement_sections'][0]['items'] ) ) {
				$total_summary['arrangement_sections'][0]['items'] = array();
			}

			$total_summary['arrangement_sections'][0]['items'][] = array(
				'id'        => 'summary_item_coupons',
				'title'     => 'Coupons',
				'alias'     => 'coupons',
				'locked'    => false,
				'static'    => false,
				'draggable' => true,
				'options'   => array(),
			);
		}

		foreach ( $total_summary['arrangement_sections'] as $section_idx => $section ) {
			$items = isset( $section['items'] ) && is_array( $section['items'] ) ? $section['items'] : array();

			foreach ( $items as $idx => $item ) {
				$items[ $idx ]['sort_id'] = $idx + 1;
			}

			$total_summary['arrangement_sections'][ $section_idx ]['items']   = $items;
			$total_summary['arrangement_sections'][ $section_idx ]['sort_id'] = $section_idx + 1;
		}

		return $total_summary;
	}
}
