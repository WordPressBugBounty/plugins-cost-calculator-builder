<?php

namespace cBuilder\Classes\Database;

use cBuilder\Classes\Vendor\DataBaseModel;


class Orders extends DataBaseModel {
	public static $pending = 'pending';
	public static $paid    = 'paid';

	public static $statusList = array( 'pending', 'paid' );

	/**
	 * Create Table
	 */
	public static function create_table() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name  = self::_table();
		$primary_key = self::$primary_key;

		$sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT,
			calc_id  INT UNSIGNED NOT NULL,
			calc_title VARCHAR(255) DEFAULT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			order_details longtext DEFAULT NULL,
			form_details longtext DEFAULT NULL,
            promocodes longtext DEFAULT NULL,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			PRIMARY KEY ({$primary_key}),
		    INDEX `idx_calc_id` (`calc_id`),
		    INDEX `idx_created_at` (`created_at`),
		    INDEX `idx_status` (`status`)
		) {$wpdb->get_charset_collate()};";

		maybe_create_table( $table_name, $sql );
	}

	/**
	 * Create Order with payment
	 */
	public static function create_order( $order_data, $payment_data ) {

		self::insert( $order_data );
		$order_id = self::insert_id();

		$payment_data['order_id'] = $order_id;
		Payments::insert( $payment_data );

		return $order_id;
	}

	/**
	 * Update Order by id
	 * todo return result later
	 */
	public static function update_order( $data, $id ) {
		global $wpdb;
		$sql   = sprintf( 'SELECT %1$s.* FROM %1$s WHERE %1$s.id = %%d', self::_table() );
		$order = $wpdb->get_row( $wpdb->prepare( $sql, intval( $id ) ), ARRAY_A ); // phpcs:ignore

		$new_order               = array_replace( $order, array_intersect_key( $data, $order ) );
		$new_order['updated_at'] = wp_date( 'Y-m-d H:i:s' );
		self::update( $new_order, array( 'id' => $id ) );
	}


	/**
	 * Update Order total by id
	 * todo return result later
	 */
	public static function update_order_total( $total, $id ) {
		global $wpdb;

		$sql   = sprintf( 'SELECT %1$s.* FROM %1$s WHERE %1$s.id = %%d', self::_table() );
		$order = $wpdb->get_row( $wpdb->prepare( $sql, intval( $id ) ), ARRAY_A ); // phpcs:ignore

		$new_order          = array_replace( $order, array_intersect_key( array(), $order ) );
		$new_order['total'] = $total;
		self::update( $new_order, array( 'id' => $id ) );
	}


	/**
	 * Update orders
	 */
	public static function update_orders( $d, $args ) {
		global $wpdb;
		$table_name = self::_table();
		$sql        = $wpdb->prepare( "UPDATE $table_name SET status = %s WHERE id IN ($d)", $args ); // phpcs:ignore
		$wpdb->get_results( $sql ); // phpcs:ignore
	}

	/**
	 * Get Orders by ids
	 */
	public static function get_by_ids( $ids = array() ) {
		if ( empty( $ids ) ) {
			return array();
		}

		global $wpdb;
		$sql = sprintf(
			'SELECT %1$s.*
					FROM %1$s
					WHERE %1$s.id IN ( %3$s )
					ORDER BY %1$s.%2$s DESC',
			self::_table(),
			static::$primary_key,
			implode( ',', $ids )
		);

		return $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore
	}

	/**
	 * Delete Order
	 */
	public static function delete_orders( $d, $ids ) {
		global $wpdb;
		$table_name = self::_table();
		$sql        = $wpdb->prepare( "DELETE FROM $table_name WHERE id IN ($d)", $ids ); // phpcs:ignore
		$wpdb->get_results( $sql ); // phpcs:ignore
	}

	/**
	 * Complete Order by id
	 */
	public static function complete_order_by_id( $id ) {
		global $wpdb;
		$table_name = self::_table();
		return $wpdb->get_results( "UPDATE $table_name SET status = 'complete' WHERE id = $id" ); // phpcs:ignore
	}

	/**
	 * Complete Order by id
	 */
	public static function update_order_total_by_id( $id ) {
		global $wpdb;
		$table_name = self::_table();
		return $wpdb->get_results( "UPDATE $table_name SET status = 'complete' WHERE id = $id" ); // phpcs:ignore
	}

	public static function existing_calcs() {
		global $wpdb;
		$table_name = self::_table();
		return $wpdb->get_results( "SELECT DISTINCT calc_id, calc_title FROM $table_name", ARRAY_A ); // phpcs:ignore
	}

	/**
	 * Get total orders
	 */
	public static function get_total_orders( $params ) {
		global $wpdb;

		$payment_method = $params['payment_method'];
		$payment_status = $params['payment_status'];
		$calc_ids       = $params['calc_ids'];
		$calc_ids_str   = is_array( $calc_ids ) ? implode( ', ', array_fill( 0, count( $calc_ids ), '%s' ) ) : '%s';

		$email     = $params['email'];
		$calc_name = $params['calc_name'];
		$order_id  = $params['order_id'];
		$start     = $params['start'];
		$end       = $params['end'];

		$payment_status_query = $payment_status ? Payments::_table() . '.status in (%s)' : '';
		$payment_method_query = $payment_method ? Payments::_table() . '.type in (%s)' : '';
		$include_and          = strlen( $payment_status_query ) > 0 && strlen( $payment_method_query ) ? ' AND ' : '';
		$payments_query       = strlen( $payment_status_query ) > 0 || strlen( $payment_method_query ) ? 'AND (
				' . $payment_status_query . ' 
				' . $include_and . ' 
				' . $payment_method_query . '
			)' : '';

		$calc_ids_query  = self::_table() . '.calc_id IN (' . $calc_ids_str . ')';
		$email_query     = ' AND JSON_UNQUOTE(JSON_EXTRACT(' . self::_table() . ' .form_details, "$.fields[1].value")) LIKE %s';
		$calc_name_query = ' AND (' . self::_table() . '.calc_title LIKE %s)';
		$order_id_query  = ' AND ' . self::_table() . '.id = %s';

		$search_query = '';
		$date_query   = '';
		$query_array  = array();

		if ( is_array( $calc_ids ) ) {
			foreach ( $calc_ids as $id ) {
				$query_array[] = $id;
			}
		} else {
			$query_array[] = $calc_ids;
		}

		$search_query .= $calc_ids_query;

		if ( ! empty( $email ) && empty( $calc_name ) && empty( $order_id ) ) {
			$query_array[] = $email . '%';
			$search_query .= $email_query;
		}
		if ( empty( $email ) && ! empty( $calc_name ) && empty( $order_id ) ) {
			$query_array[] = $calc_name . '%';
			$search_query .= $calc_name_query;
		}
		if ( empty( $email ) && empty( $calc_name ) && ! empty( $order_id ) ) {
			$query_array[] = $order_id;
			$search_query .= $order_id_query;
		}
		if ( strlen( $start ) > 4 && strlen( $end ) > 4 ) {
			$date_query .= ' AND ' . self::_table() . '.created_at BETWEEN "' . $start . ' 00:00:00" AND "' . $end . ' 23:59:59"';
		}
		// Conditionally add payment_status if it's not empty
		if ( ! empty( $payment_status ) ) {
			$query_array[] = $payment_status;
		}

		// Conditionally add payment_method if it's not empty
		if ( ! empty( $payment_method ) ) {
			$query_array[] = $payment_method;
		}
		//phpcs:disable
		$sql = $wpdb->prepare(
			'SELECT COUNT(*) 
			FROM ' . self::_table() . '
			LEFT JOIN ' . Payments::_table() . ' ON ' . self::_table() . '.id = ' . Payments::_table() . '.order_id
			WHERE ' . $search_query . '
			' . $payments_query . '
			' . $date_query . ';',
			$query_array
		);//phpcs:enable

		return $wpdb->get_var( $sql ); // phpcs:ignore
	}

	/**
	 *  Get all orders
	 */
	public static function get_all_orders( $params ) {
		global $wpdb;

		$payment_method = $params['payment_method'];
		$payment_status = $params['payment_status'];
		$calc_ids       = $params['calc_ids'];
		$calc_ids_str   = is_array( $calc_ids ) ? implode( ', ', array_fill( 0, count( $calc_ids ), '%s' ) ) : '%s';

		$email        = $params['email'];
		$calc_name    = $params['calc_name'];
		$order_id     = $params['order_id'];
		$sorting      = $params['sorting'];
		$order_by     = $params['orderBy'];
		$limit        = $params['limit'];
		$offset       = $params['offset'];
		$start        = $params['start'];
		$end          = $params['end'];
		$is_limit_off = $params['limit_off'];

		$payment_status_query = $payment_status ? Payments::_table() . '.status in (%s)' : '';
		$payment_method_query = $payment_method ? Payments::_table() . '.type in (%s)' : '';
		$include_and          = strlen( $payment_status_query ) > 0 && strlen( $payment_method_query ) ? ' AND ' : '';
		$payments_query       = strlen( $payment_status_query ) > 0 || strlen( $payment_method_query ) ? 'AND (
				' . $payment_status_query . ' 
				' . $include_and . ' 
				' . $payment_method_query . '
			)' : '';

		$calc_ids_query  = self::_table() . '.calc_id IN (' . $calc_ids_str . ')';
		$email_query     = ' AND JSON_UNQUOTE(JSON_EXTRACT(' . self::_table() . ' .form_details, "$.fields[1].value")) LIKE %s';
		$calc_name_query = ' AND (' . self::_table() . '.calc_title LIKE %s)';
		$order_id_query  = ' AND ' . self::_table() . '.id = %s';

		$search_query = '';
		$date_query   = '';
		$limit_query  = '';
		$query_array  = array();

		if ( is_array( $calc_ids ) ) {
			foreach ( $calc_ids as $id ) {
				$query_array[] = $id;
			}
		} else {
			$query_array[] = $calc_ids;
		}

		$search_query .= $calc_ids_query;

		if ( ! empty( $email ) && empty( $calc_name ) && empty( $order_id ) ) {
			$query_array[] = $email . '%';
			$search_query .= $email_query;
		}
		if ( empty( $email ) && ! empty( $calc_name ) && empty( $order_id ) ) {
			$query_array[] = $calc_name . '%';
			$search_query .= $calc_name_query;
		}
		if ( empty( $email ) && empty( $calc_name ) && ! empty( $order_id ) ) {
			$query_array[] = $order_id;
			$search_query .= $order_id_query;
		}
		if ( strlen( $start ) > 4 && strlen( $end ) > 4 ) {
			$date_query .= ' AND ' . self::_table() . '.created_at BETWEEN "' . $start . ' 00:00:00" AND "' . $end . ' 23:59:59"';
		}

		if ( true !== $is_limit_off ) {
			$limit_query .= 'LIMIT ' . $limit . ' OFFSET ' . $offset;
		}

		// Conditionally add payment_status if it's not empty
		if ( ! empty( $payment_status ) ) {
			$query_array[] = $payment_status;
		}

		// Conditionally add payment_method if it's not empty
		if ( ! empty( $payment_method ) ) {
			$query_array[] = $payment_method;
		}

		// phpcs:disable
		$sql = $wpdb->prepare(
			'SELECT ' . self::_table() . '.*, 
			' . Payments::_table() . '.type AS paymentMethod,
			' . Payments::_table() . '.currency AS paymentCurrency,
			' . Payments::_table() . '.status AS paymentStatus,
			' . Payments::_table() . '.transaction,
			' . Payments::_table() . '.total
			FROM ' . self::_table() . '
			LEFT JOIN ' . Payments::_table() . ' ON ' . self::_table() . '.id = ' . Payments::_table() . '.order_id
			WHERE ' . $search_query . '
			' . $payments_query . '
			' . $date_query . '
			ORDER BY ' . $order_by . ' ' . $sorting . '
			' . $limit_query . ';',
			$query_array
		); // phpcs:enable

		return $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore
	}

	public static function get_order_discounts( $id ) {
		$order      = self::get_order_by_id( array( 'id' => $id ) );
		$promocodes = array();

		$meta_data = get_option( 'calc_meta_data_order_' . $id, array() );
		$totals    = $meta_data['totals'];
		if ( isset( $meta_data['totals'] ) && is_string( $meta_data['totals'] ) ) {
			$totals = json_decode( $meta_data['totals'], true );
		}

		if ( ! empty( $order ) ) {
			if ( isset( $order['promocodes'] ) ) {
				$promocodes = json_decode( $order['promocodes'], true ); //phpcs:ignore
			}
		}

		return array(
			'totals'     => $totals,
			'promocodes' => $promocodes,
		);
	}

	public static function get_order_by_id( $params ) {
		global $wpdb;

		$order_table    = self::_table();
		$payments_table = Payments::_table();
		$order_id       = $params['id'];

        //phpcs:disable
		$query = $wpdb->prepare(
			"SELECT o.*,
                       p.type as paymentMethod,
                       p.currency as paymentCurrency,
                       p.status as paymentStatus,
                       p.transaction,
                       p.total
                    FROM $order_table o
                    LEFT JOIN $payments_table p ON o.id = p.order_id
                    WHERE o.id = %d
                    ",
			$order_id
		);
        // phpcs:enable

		return $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore
	}

	public static function orders_count() {
		global $wpdb;
		$sql = "SELECT COUNT(*) FROM " . self::_table(); // phpcs:ignore
		return $wpdb->get_var( $sql ); // phpcs:ignore
	}

	public static function get_order_full_data() {
		global $wpdb;

		// phpcs:disable
		$sql = "
			SELECT
				o.id as order_id,
				o.calc_id,
				o.calc_title,
				o.status,
				o.order_details,
				o.form_details,
				o.promocodes,
				p.type as payment_type,
				p.currency as payment_currency,
				p.status as payment_status,
				p.total as payment_total,
				p.transaction as payment_transaction,
				p.tax as payment_tax,
				p.paid_at
			FROM " . self::_table() . " o
			LEFT JOIN " . Payments::_table() . " p ON o.id = p.order_id
		";
		// phpcs:enable
		$orders = $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore

		foreach ( $orders as $idx => $order ) {
			$orders[ $idx ]['order_details'] = json_decode( $order['order_details'], true );
			$orders[ $idx ]['form_details']  = json_decode( $order['form_details'], true );
			$orders[ $idx ]['promocodes']    = json_decode( $order['promocodes'], true );

			$meta_data    = get_option( 'calc_meta_data_order_' . $order['order_id'], array() );
			$totals       = $meta_data['totals'];
			$other_totals = $meta_data['otherTotals'];
			if ( isset( $meta_data['totals'] ) && is_string( $meta_data['totals'] ) ) {
				$totals = json_decode( $meta_data['totals'], true );
			}

			if ( isset( $meta_data['otherTotals'] ) && is_string( $meta_data['otherTotals'] ) ) {
				$other_totals = json_decode( $meta_data['otherTotals'], true );
			}

			$orders[ $idx ]['totals']       = $totals;
			$orders[ $idx ]['other_totals'] = $other_totals;
			$orders[ $idx ]['final_total']  = $meta_data['converted'];

			$orders[ $idx ]['order_currency'] = ccb_parse_currency_format( $meta_data['converted'] );

			$discounts  = array();
			$promocodes = array();
			$all_totals = array_merge( $totals, $other_totals );
			foreach ( $all_totals as $total ) {
				if ( ! empty( $total['hasDiscount'] ) ) {
					if ( empty( $discounts[ $total['alias'] ] ) ) {
						$discounts[ $total['alias'] ] = array();
					}

					$discounts[ $total['alias'] ][] = array(
						'discount_view'   => $total['discount']['discountView'],
						'discount_title'  => $total['discount']['discountTitle'],
						'discount_type'   => $total['discount']['discountType'],
						'discount_amount' => $total['discount']['discountAmount'],
						'discount_value'  => $total['discount']['discountValue'],
					);

					if ( ! empty( $total['discount']['promocode'] ) ) {
						$promocodes[] = $total['discount']['promocode'];
					}
				}
			}

			$orders[ $idx ]['discounts']  = $discounts;
			$orders[ $idx ]['promocodes'] = $promocodes;
		}

		return $orders;
	}

	/**
	 * Get orders in batches for memory-efficient processing
	 * @param int $limit Number of orders to fetch
	 * @param int $offset Starting position
	 * @return array Orders data
	 */
	public static function get_order_full_data_batch( $limit = 50, $offset = 0 ) {
		global $wpdb;

		// phpcs:disable
		$sql = $wpdb->prepare(
			"SELECT
				o.id as order_id,
				o.calc_id,
				o.calc_title,
				o.status,
				o.order_details,
				o.form_details,
				o.promocodes,
				p.type as payment_type,
				p.currency as payment_currency,
				p.status as payment_status,
				p.total as payment_total,
				p.transaction as payment_transaction,
				p.tax as payment_tax,
				p.paid_at,
				o.created_at
			FROM " . self::_table() . " o
			LEFT JOIN " . Payments::_table() . " p ON o.id = p.order_id
			ORDER BY o.id ASC
			LIMIT %d OFFSET %d",
			$limit,
			$offset
		);
		// phpcs:enable
		$orders = $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore

		if ( empty( $orders ) ) {
			return array();
		}

		// Collect all order IDs for batch loading options
		$order_ids = array_column( $orders, 'order_id' );

		// Pre-load all meta_data for this batch (much faster than individual get_option calls)
		$meta_data_cache = array();
		foreach ( $order_ids as $order_id ) {
			$meta_data_cache[ $order_id ] = get_option( 'calc_meta_data_order_' . $order_id, array() );
		}

		foreach ( $orders as $idx => $order ) {
			$orders[ $idx ]['order_details'] = json_decode( $order['order_details'], true );
			$orders[ $idx ]['form_details']  = json_decode( $order['form_details'], true );
			$orders[ $idx ]['promocodes']    = json_decode( $order['promocodes'], true );

			$meta_data    = $meta_data_cache[ $order['order_id'] ];
			$totals       = isset( $meta_data['totals'] ) ? $meta_data['totals'] : array();
			$other_totals = isset( $meta_data['otherTotals'] ) ? $meta_data['otherTotals'] : array();

			if ( isset( $meta_data['totals'] ) && is_string( $meta_data['totals'] ) ) {
				$totals = json_decode( $meta_data['totals'], true );
			}

			if ( isset( $meta_data['otherTotals'] ) && is_string( $meta_data['otherTotals'] ) ) {
				$other_totals = json_decode( $meta_data['otherTotals'], true );
			}

			$orders[ $idx ]['totals']       = $totals;
			$orders[ $idx ]['other_totals'] = $other_totals;
			$orders[ $idx ]['final_total']  = isset( $meta_data['converted'] ) ? $meta_data['converted'] : '';

			$orders[ $idx ]['order_currency'] = ccb_parse_currency_format( isset( $meta_data['converted'] ) ? $meta_data['converted'] : '' );

			$discounts  = array();
			$promocodes = array();
			$all_totals = array_merge( $totals, $other_totals );
			foreach ( $all_totals as $total ) {
				if ( ! empty( $total['hasDiscount'] ) ) {
					if ( empty( $discounts[ $total['alias'] ] ) ) {
						$discounts[ $total['alias'] ] = array();
					}

					$discounts[ $total['alias'] ][] = array(
						'discount_view'   => isset( $total['discount']['discountView'] ) ? $total['discount']['discountView'] : '',
						'discount_title'  => isset( $total['discount']['discountTitle'] ) ? $total['discount']['discountTitle'] : '',
						'discount_type'   => isset( $total['discount']['discountType'] ) ? $total['discount']['discountType'] : '',
						'discount_amount' => isset( $total['discount']['discountAmount'] ) ? $total['discount']['discountAmount'] : 0,
						'discount_value'  => isset( $total['discount']['discountValue'] ) ? $total['discount']['discountValue'] : '',
					);

					if ( ! empty( $total['discount']['promocode'] ) ) {
						$promocodes[] = $total['discount']['promocode'];
					}
				}
			}

			$orders[ $idx ]['discounts']  = $discounts;
			$orders[ $idx ]['promocodes'] = $promocodes;
		}

		return $orders;
	}
}
