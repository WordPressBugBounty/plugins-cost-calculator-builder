<?php

use CCB\Vite;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function cBuilder_admin_enqueue() {
	wp_enqueue_style( 'ccb-global-styles', CALC_URL . '/frontend/dist/css/global.css', array(), CALC_VERSION );
	wp_enqueue_style( 'ccb-icons-list', CALC_URL . '/frontend/dist/css/icon/style.css', array(), CALC_VERSION );
	wp_enqueue_style( 'ccb-pdf-template', CALC_URL . '/frontend/dist/css/pdf-template.css', array(), CALC_VERSION );

	/** Loading wp media libraries **/
	if ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_builder' ) ) { //phpcs:ignore
		wp_enqueue_media();
		wp_enqueue_script( 'cbb-resize-sensor-js', CALC_URL . '/frontend/dist/sticky/ResizeSensor.js', array(), CALC_VERSION, true );
		wp_enqueue_script( 'cbb-sticky-sidebar-js', CALC_URL . '/frontend/dist/sticky/sticky-sidebar.js', array( 'cbb-resize-sensor-js' ), CALC_VERSION, true );

		wp_enqueue_style( 'ccb-calc-font', CALC_URL . '/frontend/dist/css/font/font.css', array(), CALC_VERSION );
		wp_enqueue_style( 'ccb-bootstrap-css', CALC_URL . '/frontend/dist/css/bootstrap.min.css', array(), CALC_VERSION );
		wp_enqueue_style( 'ccb-front-app-css', CALC_URL . '/frontend/dist/css/style.css', array(), CALC_VERSION );
		wp_enqueue_style( 'ccb-admin-app-css', CALC_URL . '/frontend/dist/css/admin.css', array(), CALC_VERSION );
		wp_enqueue_style( 'ccb-templates-css', CALC_URL . '/frontend/dist/css/templates.css', array(), CALC_VERSION );

		wp_enqueue_script( 'ccb-quick-tour-core-js', CALC_URL . '/frontend/dist/quick-tour/quick-tour-core.js', array( 'cbb-bundle-js' ), CALC_VERSION, true );
		wp_enqueue_script( 'cbb-feedback', CALC_URL . '/frontend/dist/feedback.js', array(), CALC_VERSION, true );

		wp_enqueue_style( 'ccb-calc-font', CALC_URL . '/frontend/dist/css/font/font.css', array(), CALC_VERSION );
		wp_enqueue_style( 'ccb-admin-welcome-css', CALC_URL . '/frontend/dist/css/welcome.css', array(), CALC_VERSION );
		wp_enqueue_script( 'cbb-admin-welcome-js', CALC_URL . '/frontend/dist/welcome.js', array( 'jquery' ), CALC_VERSION ); // phpcs:ignore
		wp_enqueue_script( 'cbb-phone-js', CALC_URL . '/frontend/dist/libs/vue/phone/vue-phone-number-input.umd.js', array(), CALC_VERSION, true );

	} elseif ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_analytics' ) ) { //phpcs:ignore
		Vite\enqueue_asset(
			CALC_PATH . '/frontend/vue3/dist',
			'src/analytics/main.ts',
			array(
				'handle'    => 'ccb-analytics-bundle',
				'in-footer' => true,
			)
		);

		// phpcs:disable
		$handle_data = array(
				'ajax_url'     => admin_url( 'admin-ajax.php' ),
				'dateFormat'   => get_option( 'date_format' ),
				'language'     => substr( get_bloginfo( 'language' ), 0, 2 ),
				'plugin_url'   => CALC_URL,
				'translations' => \cBuilder\Classes\CCBTranslations::get_full_admin_translations(),
				'pro_active'   => ccb_pro_active(),
                'plugin_version' => CALC_VERSION,
                'menu_items'     => \cBuilder\Classes\CCBSettingsData::get_menu_items(),
		);
		// phpcs:enable

		wp_localize_script(
			'ccb-analytics-bundle',
			'ccb_ajax_window',
			$handle_data
		);
	} elseif ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_gopro' ) ) { //phpcs:ignore
		wp_enqueue_style( 'ccb-calc-font', CALC_URL . '/frontend/dist/css/font/font.css', array(), CALC_VERSION );
		wp_enqueue_style( 'ccb-admin-gopro-css', CALC_URL . '/frontend/dist/css/gopro.css', array(), CALC_VERSION );
	} elseif ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_pro_features' ) ) { //phpcs:ignore
		wp_enqueue_style( 'ccb-calc-font', CALC_URL . '/frontend/dist/css/font/font.css', array(), CALC_VERSION );
		wp_enqueue_style( 'ccb-admin-pro-features-css', CALC_URL . '/frontend/dist/css/pro-features.css', array(), CALC_VERSION );
	} elseif ( ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_builder-affiliation' ) ) // phpcs:ignore
		|| ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_builder-account' ) ) // phpcs:ignore
		|| ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_builder-contact' ) ) // phpcs:ignore
	) {
		wp_enqueue_style( 'ccb-calc-font', CALC_URL . '/frontend/dist/css/font/font.css', array(), CALC_VERSION );
	} elseif ( isset( $_GET['page'] ) && ( $_GET['page'] === 'cost_calculator_orders' ) ) { //phpcs:ignore
		Vite\enqueue_asset(
			CALC_PATH . '/frontend/vue3/dist',
			'src/orders/main.ts',
			array(
				'handle'    => 'ccb-orders-bundle',
				'in-footer' => true,
			)
		);

		wp_localize_script(
			'ccb-orders-bundle',
			'ccb_ajax_window',
			array(
				'ajax_url'       => admin_url( 'admin-ajax.php' ),
				'dateFormat'     => get_option( 'date_format' ),
				'language'       => substr( get_bloginfo( 'language' ), 0, 2 ),
				'plugin_url'     => CALC_URL,
				'translations'   => \cBuilder\Classes\CCBTranslations::get_full_admin_translations(),
				'pro_active'     => ccb_pro_active(),
				'plugin_version' => CALC_VERSION,
				'menu_items'     => \cBuilder\Classes\CCBSettingsData::get_menu_items(),
				'woo_url'        => esc_url( get_admin_url() . 'edit.php?post_type=shop_order' ),
				'current_page'   => isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : '', // phpcs:ignore WordPress.Security.NonceVerification
			)
		);
	}

	if ( ! empty( $_GET['tab'] ) && isset( $_GET['page'] ) && 'cost_calculator_builder' === $_GET['page'] ) {
		wp_enqueue_style( 'ccb-pdf-template', CALC_URL . '/frontend/dist/css/pdf-template.css', array(), CALC_VERSION );
	}
}

add_action( 'admin_enqueue_scripts', 'cBuilder_admin_enqueue', 1 );
