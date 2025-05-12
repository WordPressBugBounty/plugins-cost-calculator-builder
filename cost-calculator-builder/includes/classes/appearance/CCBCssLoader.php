<?php

namespace cBuilder\Classes\Appearance;

class CCBCssLoader {
	private $appearance;

	private $calc_id;

	private static $processed_calcs = array();

	public function __construct( $calc_id, $appearance ) {
		$this->calc_id    = $calc_id;
		$this->appearance = $appearance;
	}

	public function generate_color( $color, $alpha ) {
		if ( 7 >= strlen( $color ) && 0 !== $alpha ) {
			return $color . $alpha;
		}
		return $color;
	}

	public function from_percent( $value ) {
		$hex = dechex( round( ( $value * 255 ) / 100 ) );
		$hex = strtoupper( $hex );
		return $value < 7 ? '0' . $hex : $hex;
	}


	public function ccb_upload_root_css() {
		$current_filter        = current_filter();
		$direct_output_filters = array( 'wp_footer', 'the_content' );

		if ( in_array( $current_filter, $direct_output_filters, true ) ) {
			if ( ! isset( self::$processed_calcs[ $this->calc_id ] ) ) {
				self::$processed_calcs[ $this->calc_id ] = true;
				echo '<style id="ccb-css-' . esc_attr($this->calc_id) . '">' . $this->get_css_function() . '</style>'; //phpcs:ignore
			}
		} else {
			if ( is_admin() ) {
				if ( ! isset( self::$processed_calcs[ $this->calc_id ] ) ) {
					self::$processed_calcs[ $this->calc_id ] = true;

					$handle_name = 'ccb-appearance-' . $this->calc_id;
					wp_add_inline_style( $handle_name, $this->get_css_function() );
					wp_enqueue_style( $handle_name );
				}
			} else {
				//phpcs:disable
				$hooks = array( 'wp_enqueue_scripts', 'elementor/frontend/after_enqueue_styles', 'wp_footer' );
				
				foreach ( $hooks as $hook ) {
					add_action( $hook, function() use ( $hook ) {
						if ( ! isset( self::$processed_calcs[ $this->calc_id ] ) ) {
							self::$processed_calcs[ $this->calc_id ] = true;
							
							$handle_name = 'ccb-appearance-' . $this->calc_id;

							if ( 'wp_footer' === $hook ) {
								echo '<style id="ccb-css-' . esc_attr( $this->calc_id ) . '">' . $this->get_css_function() . '</style>';
							} else {
								wp_add_inline_style( $handle_name, $this->get_css_function() );
								wp_enqueue_style( $handle_name );
							}
						}
					}, 20 );
				}
				//phpcs:enable
			}
		}
	}

	private function get_css_function() {
		// Colors
		$desktop_colors    = $this->appearance['desktop']['colors']['data'];
		$container_color   = $desktop_colors['container']['value']['color'];
		$container_opacity = $desktop_colors['container']['value']['opacity'];
		$ccb_text_color    = $desktop_colors['primary_color']['value'];
		$ccb_accent_color  = $desktop_colors['accent_color']['value'];
		$ccb_fields_color  = $desktop_colors['secondary_color']['value'];
		$ccb_error_color   = $desktop_colors['error_color']['value'];

		$container_invert    = '';
		$container_converted = $this->generate_color( $container_color, $this->from_percent( $container_opacity ) );
		if ( ! empty( $desktop_colors['container']['value']['blur'] ) ) {
			$container_converted = 'inherit';
			$container_invert    = 'invert(' . $desktop_colors['container']['value']['blur'] . '%)';
		}

		// Font settings
		$desktop_typography         = $this->appearance['desktop']['typography']['data'];
		$ccb_header_size            = $desktop_typography['header_font_size']['value'] . 'px';
		$ccb_header_weight          = $desktop_typography['header_font_weight']['value'];
		$ccb_field_size             = $desktop_typography['label_font_size']['value'] . 'px';
		$ccb_field_weight           = $desktop_typography['fields_btn_font_weight']['value'];
		$ccb_field_label_weight     = $desktop_typography['label_font_weight']['value'];
		$ccb_description_size       = $desktop_typography['description_font_size']['value'] . 'px';
		$ccb_description_weight     = $desktop_typography['description_font_weight']['value'];
		$ccb_summary_size           = $desktop_typography['summary_header_size']['value'] . 'px';
		$ccb_summary_weight         = $desktop_typography['summary_header_font_weight']['value'];
		$ccb_summary_text_size      = $desktop_typography['total_field_font_size']['value'] . 'px';
		$ccb_summary_text_weight    = $desktop_typography['total_field_font_weight']['value'];
		$ccb_summary_text_transform = $desktop_typography['total_text_transform']['value'];
		$ccb_grand_total_size       = $desktop_typography['total_font_size']['value'] . 'px';
		$ccb_grand_total_weight     = $desktop_typography['total_font_weight']['value'];
		$ccb_fields_button_size     = $desktop_typography['fields_btn_font_size']['value'] . 'px';
		$ccb_fields_button_weight   = $desktop_typography['fields_btn_font_weight']['value'];

		$mobile_typography                 = $this->appearance['mobile']['typography']['data'];
		$ccb_mobile_header_size            = $mobile_typography['header_font_size']['value'] . 'px';
		$ccb_mobile_header_weight          = $mobile_typography['header_font_weight']['value'];
		$ccb_mobile_field_size             = $mobile_typography['label_font_size']['value'] . 'px';
		$ccb_mobile_field_weight           = $mobile_typography['fields_btn_font_weight']['value'];
		$ccb_mobile_field_label_weight     = $mobile_typography['label_font_weight']['value'];
		$ccb_mobile_description_size       = $mobile_typography['description_font_size']['value'] . 'px';
		$ccb_mobile_description_weight     = $mobile_typography['description_font_weight']['value'];
		$ccb_mobile_summary_size           = $mobile_typography['summary_header_size']['value'] . 'px';
		$ccb_mobile_summary_weight         = $mobile_typography['summary_header_font_weight']['value'];
		$ccb_mobile_summary_text_size      = $mobile_typography['total_field_font_size']['value'] . 'px';
		$ccb_mobile_summary_text_weight    = $mobile_typography['total_field_font_weight']['value'];
		$ccb_mobile_summary_text_transform = $mobile_typography['total_text_transform']['value'];
		$ccb_mobile_grand_total_size       = $mobile_typography['total_font_size']['value'] . 'px';
		$ccb_mobile_grand_total_weight     = $mobile_typography['total_font_weight']['value'];
		$ccb_mobile_fields_button_size     = $mobile_typography['fields_btn_font_size']['value'] . 'px';
		$ccb_mobile_fields_button_weight   = $mobile_typography['fields_btn_font_weight']['value'];

		// Borders
		$desktop_borders             = $this->appearance['desktop']['borders']['data'];
		$ccb_container_border        = $desktop_borders['container_border']['value']['width'] . 'px';
		$ccb_container_border_radius = $desktop_borders['container_border']['value']['radius'] . 'px';
		$ccb_container_border_style  = $desktop_borders['container_border']['value']['type'];
		$ccb_fields_border           = $desktop_borders['fields_border']['value']['width'] . 'px';
		$ccb_fields_border_radius    = $desktop_borders['fields_border']['value']['radius'] . 'px';
		$ccb_fields_border_style     = $desktop_borders['fields_border']['value']['type'];
		$ccb_button_border           = $desktop_borders['button_border']['value']['width'] . 'px';
		$ccb_button_border_radius    = $desktop_borders['button_border']['value']['radius'] . 'px';
		$ccb_button_border_style     = $desktop_borders['button_border']['value']['type'];

		// Box shadow
		$desktop_box_shadow            = $this->appearance['desktop']['shadows']['data'];
		$ccb_container_shadow_blur     = $desktop_box_shadow['container_shadow']['value']['blur'] . 'px';
		$ccb_container_shadow_x_offset = $desktop_box_shadow['container_shadow']['value']['x'] . 'px';
		$ccb_container_shadow_y_offset = $desktop_box_shadow['container_shadow']['value']['y'] . 'px';
		$ccb_container_shadow_color    = $desktop_box_shadow['container_shadow']['value']['color'];

		// Sizes
		$desktop_sizes             = $this->appearance['desktop']['elements_sizes']['data'];
		$ccb_field_button_height   = $desktop_sizes['field_and_buttons_height']['value'] . 'px';
		$ccb_vertical_max_width    = $desktop_sizes['container_vertical_max_width']['value'] . 'px';
		$ccb_horizontal_max_width  = $desktop_sizes['container_horizontal_max_width']['value'] . 'px';
		$ccb_two_columns_max_width = $desktop_sizes['container_two_column_max_width']['value'] . 'px';

		// Spacing & Positions
		$desktop_spacing_and_positions = $this->appearance['desktop']['spacing_and_positions']['data'];
		$ccb_field_side_indent         = $desktop_spacing_and_positions['field_side_indents']['value'] . 'px';
		$ccb_field_spacing             = $desktop_spacing_and_positions['field_spacing']['value'] . 'px';
		$ccb_summary_spacing           = $desktop_spacing_and_positions['field_spacing']['value'] / 2 . 'px';
		$ccb_summary_group_spacing     = $desktop_spacing_and_positions['field_spacing']['value'] / 2 / 2 . 'px';
		$ccb_container_margin_top      = $desktop_spacing_and_positions['container_margin']['value'][0] . 'px';
		$ccb_container_margin_bottom   = $desktop_spacing_and_positions['container_margin']['value'][1] . 'px';
		$ccb_container_margin_left     = $desktop_spacing_and_positions['container_margin']['value'][2] . 'px';
		$ccb_container_margin_right    = $desktop_spacing_and_positions['container_margin']['value'][3] . 'px';
		$ccb_container_padding_top     = $desktop_spacing_and_positions['container_padding']['value'][0] . 'px';
		$ccb_container_padding_bottom  = $desktop_spacing_and_positions['container_padding']['value'][2] . 'px';
		$ccb_container_padding_left    = $desktop_spacing_and_positions['container_padding']['value'][1] . 'px';
		$ccb_container_padding_right   = $desktop_spacing_and_positions['container_padding']['value'][3] . 'px';

		// custom variables
		$ccb_fields_bg_color           = $ccb_fields_color;
		$ccb_fields_bg_color_alpha     = self::generate_color( $ccb_accent_color, '1A' );
		$ccb_fields_border_color       = self::generate_color( $ccb_text_color, '1A' );
		$ccb_container_dark_color      = self::generate_color( $ccb_text_color, '1D' );
		$ccb_fields_description_color  = self::generate_color( $ccb_text_color, '80' );
		$ccb_fields_hover_color        = self::generate_color( $ccb_text_color, '1a' );
		$ccb_summary_description_color = self::generate_color( $ccb_text_color, 'B3' );
		$ccb_toggle_label_bg           = self::generate_color( $ccb_text_color, '33' );

		$ccb_grand_total_spacing = $desktop_spacing_and_positions['field_spacing']['value'] / 2 . 'px';
		$ccb_payment_label_size  = $desktop_typography['total_font_size']['value'] - 1 . 'px';

		$ccb_fields_size_2 = $desktop_typography['label_font_size']['value'] - 2 . 'px';

		// Date picker
		$ccb_date_picker_day        = self::generate_color( $ccb_text_color, '0D' );
		$ccb_date_picker_picket_day = self::generate_color( $ccb_accent_color, '1D' );

		$ccb_payment_bg_color   = self::generate_color( $container_color, '0D' );
		$ccb_page_done_bg_color = self::generate_color( $ccb_accent_color, '30' );

		// button light
		$ccb_button_light_bg       = self::generate_color( $ccb_text_color, '0D' );
		$ccb_button_light_bg_alpha = self::generate_color( $ccb_text_color, '26' );

		// repeater
		$ccb_repeater_title_font_size = $desktop_typography['total_field_font_size']['value'] - 2 . 'px';

		$handle_name = 'ccb-appearance-' . $this->calc_id;
		wp_register_style( $handle_name, false, array(), CALC_VERSION );

		return "
		        #ccb-preview-overlay,
			    #ccb_app_$this->calc_id,
			    .ccb-sticky-floating-$this->calc_id {
				    --ccb-container-converted:       $container_converted;
					--ccb-container-invert:          $container_invert;
			        --ccb-container-color:           $container_color;
			        --ccb-container-opacity:         $container_opacity;
			        --ccb-container-dark-color:      $ccb_container_dark_color;
			        --ccb-container-border-color:    $ccb_fields_border_color;

					--ccb-payment-bg-color:          $ccb_payment_bg_color;

			        --ccb-text-color:                $ccb_text_color;
			        --ccb-accent-color:              $ccb_accent_color;
			        --ccb-fields-color:			     $ccb_fields_color;
			        --ccb-fields-bg-color:           $ccb_fields_bg_color;
			        --ccb-fields-border-color:       $ccb_fields_border_color;
			        --ccb-fields-description-color:  $ccb_fields_description_color;
			        --ccb-fields-hover-color:        $ccb_fields_hover_color;
			        --ccb-error-color:			     $ccb_error_color;
			        --ccb-summary-description-color: $ccb_summary_description_color;
			        --ccb-toggle-label-bg:           $ccb_toggle_label_bg;
			        --ccb-fields-bg-color-alpha:     $ccb_fields_bg_color_alpha;

			        --ccb-header-size:			     $ccb_header_size;
			        --ccb-header-weight:			 $ccb_header_weight;

			        --ccb-field-size:			     $ccb_field_size;
			        --ccb-field-weight:			     $ccb_field_weight;
					--ccb-field-label-weight:		 $ccb_field_label_weight;
			        --ccb-description-size:          $ccb_description_size;
			        --ccb-description-weight:        $ccb_description_weight;
			        --ccb-payment-label-size:        $ccb_payment_label_size;
			        --ccb-field-size-2:			     $ccb_fields_size_2;

			        --ccb-summary-header-size:       $ccb_summary_size;
			        --ccb-summary-header-weight:     $ccb_summary_weight;

			        --ccb-summary-text-size:         $ccb_summary_text_size;
			        --ccb-summary-text-weight:       $ccb_summary_text_weight;
			        --ccb-summary-text-transform:    $ccb_summary_text_transform;

			        --ccb-grand-total-size:          $ccb_grand_total_size;
			        --ccb-grand-total-weight:        $ccb_grand_total_weight;

			        --ccb-fields-button-size:        $ccb_fields_button_size;
			        --ccb-fields-button-weight:      $ccb_fields_button_weight;

					--ccb-mobile-header-size:         $ccb_mobile_header_size;
					--ccb-mobile-header-weight:       $ccb_mobile_header_weight;

					--ccb-mobile-field-size:          $ccb_mobile_field_size;
					--ccb-mobile-field-weight:        $ccb_mobile_field_weight;
					--ccb-mobile-field-label-weight:  $ccb_mobile_field_label_weight;

					--ccb-mobile-description-size:    $ccb_mobile_description_size;
					--ccb-mobile-description-weight:  $ccb_mobile_description_weight;

					--ccb-mobile-summary-size:        $ccb_mobile_summary_size;
					--ccb-mobile-summary-weight:      $ccb_mobile_summary_weight;

					--ccb-mobile-summary-text-size:   $ccb_mobile_summary_text_size;
					--ccb-mobile-summary-text-weight: $ccb_mobile_summary_text_weight;

					--ccb-mobile-summary-text-transform: $ccb_mobile_summary_text_transform;

					--ccb-mobile-grand-total-size:     $ccb_mobile_grand_total_size;
					--ccb-mobile-grand-total-weight:   $ccb_mobile_grand_total_weight;

					--ccb-mobile-fields-button-size: $ccb_mobile_fields_button_size;
					--ccb-mobile-fields-button-weight: $ccb_mobile_fields_button_weight;

			        --ccb-container-border:          $ccb_container_border;
			        --ccb-container-border-radius:   $ccb_container_border_radius;
			        --ccb-container-border-style:    $ccb_container_border_style;

			        --ccb-fields-border:             $ccb_fields_border;
			        --ccb-fields-border-radius:      $ccb_fields_border_radius;
			        --ccb-fields-border-style:       $ccb_fields_border_style;

			        --ccb-button-border:             $ccb_button_border;
			        --ccb-button-border-radius:      $ccb_button_border_radius;
			        --ccb-button-border-style:       $ccb_button_border_style;

			        --ccb-container-shadow-blur:     $ccb_container_shadow_blur;
			        --ccb-container-shadow-x-offset: $ccb_container_shadow_x_offset;
			        --ccb-container-shadow-y-offset: $ccb_container_shadow_y_offset;
			        --ccb-container-shadow-color:    $ccb_container_shadow_color;

			        --ccb-field-button-height:       $ccb_field_button_height;
			        --ccb-vertical-max-width:        $ccb_vertical_max_width;
			        --ccb-horizontal-max-width:      $ccb_horizontal_max_width;
			        --ccb-two-columns-max-width:     $ccb_two_columns_max_width;

			        --ccb-field-side-indent:         $ccb_field_side_indent;
			        --ccb-field-spacing:             $ccb_field_spacing;
					--ccb-summary-spacing:           $ccb_summary_spacing;
					--ccb-summary-group-spacing:     $ccb_summary_group_spacing;
			        --ccb-grand-total-spacing:       $ccb_grand_total_spacing;
			        --ccb-container-margin-top:      $ccb_container_margin_top;
			        --ccb-container-margin-bottom:   $ccb_container_margin_bottom;
			        --ccb-container-margin-left:     $ccb_container_margin_left;
			        --ccb-container-margin-right:    $ccb_container_margin_right;
			        --ccb-container-padding-top:     $ccb_container_padding_top;
			        --ccb-container-padding-bottom:  $ccb_container_padding_bottom;
			        --ccb-container-padding-left:    $ccb_container_padding_left;
			        --ccb-container-padding-right:   $ccb_container_padding_right;

			        --ccb-date-picker-day:           $ccb_date_picker_day;
					--ccb-date-picker-picket-day:    $ccb_date_picker_picket_day;
			        --ccb-button-light-bg:           $ccb_button_light_bg;
			        --ccb-button-light-bg-alpha:     $ccb_button_light_bg_alpha;
					--ccb-page-done-bg-color:        $ccb_page_done_bg_color;
					--ccb-repeater-title-font-size:  $ccb_repeater_title_font_size;
			    }
			";
	}
}
