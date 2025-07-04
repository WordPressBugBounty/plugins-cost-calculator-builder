<?php

namespace cBuilder\Classes\Database;

use cBuilder\Classes\Vendor\DataBaseModel;

class Forms extends DataBaseModel {
	/**
	 * Create Table
	 */
	public static function create_table() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name  = self::_table();
		$primary_key = self::$primary_key;

		$sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
			{$primary_key} INT UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY ({$primary_key})
		) {$wpdb->get_charset_collate()};";

		maybe_create_table( $table_name, $sql );

	}

	public static function create_default_form( $forms_count, $fields = array(), $name = '' ) {
		global $wpdb;

		$default_form = array(
			'name' => ! empty( $name ) ? $name : 'Form ' . ( $forms_count + 1 ),
		);

		self::insert( $default_form );
		$form_id = $wpdb->insert_id;

		FormFields::create_form_fields( $form_id, $fields );

		return $form_id;
	}

	public static function delete_form( $form_id ) {
		$result = self::delete( $form_id );

		global $wpdb;

		$meta_key   = 'form_id';
		$meta_value = $form_id;

		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM $wpdb->postmeta WHERE meta_key = %s AND meta_value = %s",
				$meta_key,
				$meta_value
			)
		);

		return $result;
	}

	public static function duplicate_form( $form_id ) {
		global $wpdb;

		$original_form_id = intval( $form_id );
		$forms_table      = self::_table();
		$form_id          = self::$primary_key;

		$sql = "INSERT INTO {$forms_table} (name, created_at, updated_at)
		SELECT name, NOW(), NOW()
		FROM {$forms_table}
		WHERE {$form_id} = %d";

		$wpdb->query( $wpdb->prepare( $sql, $original_form_id ) );// phpcs:ignore

		$new_form_id = $wpdb->insert_id;

		FormFields::duplicate_form_fields( $new_form_id, $original_form_id );

		return $new_form_id;

	}

	public static function update_form( $form_id, $form_name, $form_builder_data ) {

		if ( isset( $form_name ) ) {
			$data  = array( 'name' => $form_name );
			$where = array( 'id' => $form_id );
			self::update( $data, $where );
		}

		$field_list = array();

		foreach ( $form_builder_data as $field ) {
			if ( isset( $field['id'] ) ) {
				FormFields::update_field( $field );
				$field_list[] = $field['id'];
			} elseif ( isset( $field['tempId'] ) ) {
				$field_id     = FormFields::create_field( $form_id, $field );
				$field_list[] = $field_id;
			}
		}

		FormFields::clean_list( $form_id, $field_list );

		return FormFields::get_active_fields( $form_id );
	}

	public static function create_default_forms() {
		$forms_count = ! empty( self::get_all_forms() ) ? count( self::get_all_forms() ) : 0;
		$form_id     = self::create_default_form( $forms_count );

		$calculators = self::get_all_calculators();

		foreach ( $calculators as $calc ) {
			add_post_meta( $calc->ID, 'form_id', $form_id, true );
		}
	}

	public static function create_default_form_for_calculator( $calc_id, $fields = array(), $name = '' ) {
		$forms_count = ! empty( self::get_all_forms() ) ? count( self::get_all_forms() ) : 0;
		$form_id     = self::create_default_form( $forms_count, $fields, $name );
		add_post_meta( $calc_id, 'form_id', $form_id, true );
	}

	public static function get_all_forms() {
		global $wpdb;

		$sql = sprintf(
			'SELECT	%1$s.*
					FROM %1$s
					ORDER BY %1$s.id DESC
					',
			self::_table()
		);

		return $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore
	}

	public static function get_form_name( $form_id ) {
		if ( ! is_numeric( $form_id ) ) {
			return;
		}

		global $wpdb;

		$sql = sprintf(
			'SELECT	name
					FROM %1$s
					WHERE %2$s = %3$s
					',
			self::_table(),
			self::$primary_key,
			$form_id
		);

		return $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore
	}

	public static function get_all_calculators() {
		$args = array(
			'posts_per_page' => - 1,
			'post_type'      => 'cost-calc',
			'post_status'    => array( 'publish' ),
		);

		$calculators = new \WP_Query( $args );

		return $calculators->posts;
	}

	public static function get_export_data( $calc_id ) {
		$form_id     = get_post_meta( $calc_id, 'form_id', true );
		$form_fields = array();
		$form_data   = array();

		if ( '' !== $form_id ) {
			$form_fields = \cBuilder\Classes\Database\FormFields::get_active_fields( $form_id );
			$form_data   = self::get_form_name( $form_id );
		}

		return array(
			'form_data'   => $form_data,
			'form_fields' => $form_fields,
		);
	}

	public static function compare_and_maybe_create( $calc_id, $data ) {
		$forms            = self::get_all_forms();
		$import_form_name = '';
		$forms_fields     = array();
		$created          = false;

		if ( ! empty( $data['form_data'][0]['name'] ) ) {
			$import_form_name = $data['form_data'][0]['name'];
			$forms_fields     = $data['form_fields'] ?? array();
		}

		if ( ! empty( $import_form_name ) && ! empty( $forms_fields ) ) {
			foreach ( $forms as $form ) {
				$same   = true;
				$fields = FormFields::get_active_fields( $form['id'] );
				if ( ! $created && ( $form['name'] === $import_form_name || count( $forms_fields ) === count( $fields ) ) ) {
					foreach ( $fields as $idx => $field ) {
						if ( ! empty( $field['type'] ) && 'space' === $field['type'] ) {
							continue;
						}

						$imported_field = $forms_fields[ $idx ] ?? null;
						if ( $same && $imported_field && $imported_field['sort_id'] === $field['sort_id'] && $imported_field['type'] === $field['type'] && count( $imported_field['attributes'] ) === count( $field['attributes'] ) ) {
							foreach ( $field['attributes'] as $attr_idx => $attribute ) {
								$imported_attr = $imported_field['attributes'][ $attr_idx ];
								if ( ! is_array( $imported_attr ) && $imported_attr !== $attribute && ! empty( $imported_attr ) && ! empty( $attribute ) ) {
									$same = false;
								}

								if ( is_array( $imported_attr ) && ! empty( $imported_attr ) && ! empty( $attribute ) && count( $imported_attr ) !== count( $attribute ) ) {
									$same = false;
								}
							}
						} else {
							$same = false;
						}
					}
				} else {
					$same = false;
				}

				if ( $same ) {
					add_post_meta( $calc_id, 'form_id', $form['id'], true );
					$created = true;
				}
			}
		}

		if ( ! $created ) {
			self::create_default_form_for_calculator( $calc_id, $forms_fields, $import_form_name );
		}
	}
}
