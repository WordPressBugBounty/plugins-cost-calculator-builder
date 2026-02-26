<div class="cbb-edit-field-container">
	<div class="ccb-edit-field-header">
		<div class="ccb-edit-field-header-left">
			<span class="ccb-edit-field-title ccb-heading-3 ccb-bold">{{ getFieldTitle(radioField) || "Radio select" }}</span>
		</div>
		<div class="ccb-edit-field-header-right">
			<div class="ccb-save-wrapper">
				<button class="ccb-button" @click.prevent="$emit( 'cancel' )"><?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?></button>
				<button class="ccb-button success" @click.prevent="save(radioField, id, index, radioField.alias)"><?php esc_html_e( 'Done', 'cost-calculator-builder' ); ?></button>
			</div>
		</div>
	</div>
	<div class="ccb-grid-box">
		<div class="container">
			<div class="row">
				<div class="col-12">
					<div class="ccb-edit-field-switch">
						<div class="ccb-edit-field-switch-item ccb-default-title" :class="{active: tab === 'main'}" @click="tab = 'main'">
							<?php esc_html_e( 'Element', 'cost-calculator-builder' ); ?>
							<span class="ccb-fields-required" v-if="errorsCount > 0">{{ errorsCount }}</span>
						</div>
						<div class="ccb-edit-field-switch-item ccb-default-title ccb-edit-style-field-switch-item" :class="{active: tab === 'style'}" @click="tab = 'style'">
							<?php esc_html_e( 'Variants', 'cost-calculator-builder' ); ?>
						</div>
						<div class="ccb-edit-field-switch-item ccb-default-title" :class="{active: tab === 'options'}" @click="tab = 'options'">
							<?php esc_html_e( 'Settings', 'cost-calculator-builder' ); ?>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="container" v-show="tab === 'main'">
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-field-name">
						<div class="ccb-field-name__header">
							<div class="ccb-field-name__label"><?php esc_html_e( 'Element name', 'cost-calculator-builder' ); ?></div>
							<div class="ccb-field-name__id">{{ radioField.alias }}</div>
						</div>
						<div class="ccb-field-name__body">
							<input type="text" placeholder="<?php esc_attr_e( 'Enter field name', 'cost-calculator-builder' ); ?>" v-model.trim="radioField.label">
							<input type="text" placeholder="<?php esc_attr_e( 'Enter field description', 'cost-calculator-builder' ); ?>" v-model.trim="radioField.description">
						</div>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-builder-radio-wrapper">
						<span class="ccb-radio-label"><?php esc_html_e( 'Element Width (%)', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-radio-box">
							<input class="ccb-builder-radio__radio" :id="'ccb-width-25-' + radioField.alias" type="radio" :name="'width-' + radioField.alias" value="25" v-model="radioField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 25 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-25-' + radioField.alias"><?php esc_html_e( '25', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-50-' + radioField.alias" type="radio" :name="'width-' + radioField.alias" value="50" v-model="radioField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 50 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-50-' + radioField.alias"><?php esc_html_e( '50', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-75-' + radioField.alias" type="radio" :name="'width-' + radioField.alias" value="75" v-model="radioField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 75 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-75-' + radioField.alias"><?php esc_html_e( '75', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-100-' + radioField.alias" type="radio" :name="'width-' + radioField.alias" value="100" v-model="radioField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 100 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-100-' + radioField.alias"><?php esc_html_e( '100', 'cost-calculator-builder' ); ?></label>
						</div>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-select-box">
						<span class="ccb-select-label"><?php esc_html_e( 'Default Value', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-select-wrapper">
							<i class="ccb-icon-Path-3485 ccb-select-arrow"></i>
							<select class="ccb-select" v-model="radioField.default">
								<option value="" selected><?php esc_html_e( 'Not selected', 'cost-calculator-builder' ); ?></option>
								<option v-for="(value, index) in options" :key="index" :value="(value.optionValue || 0) + '_' + index">{{ value.optionText }}</option>
							</select>
						</div>
					</div>
				</div>
				<div class="col-12 ccb-p-t-15">
					<div class="ccb-select-box">
						<span class="ccb-select-label"><?php esc_html_e( 'Type of Label in Total', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-select-wrapper">
							<i class="ccb-icon-Path-3485 ccb-select-arrow"></i>
							<select class="ccb-select big" v-model="radioField.summary_view">
								<option value="show_value" selected><?php esc_html_e( 'Show Value', 'cost-calculator-builder' ); ?></option>
								<option value="show_label_not_calculable"><?php esc_html_e( 'Label Only (No Calculation)', 'cost-calculator-builder' ); ?></option>
								<option value="show_label_calculable"><?php esc_html_e( 'Label Only (Calculate Value)', 'cost-calculator-builder' ); ?></option>
							</select>
						</div>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-options-container radio">
						<draggable
								v-model="fieldOptions"
								class="ccb-options ccb-column-options"
								draggable=".ccb-option"
								:animation="200"
								handle=".ccb-option-drag"
						>
							<div class="ccb-option" v-for="(option, index) in fieldOptions" :key="index">
								<div class="ccb-option-drag" :class="{disabled: fieldOptions.length === 1}">
									<i class="ccb-icon-drag-dots"></i>
								</div>
								<div class="ccb-option-delete" @click.prevent="removeOption(index, option.optionValue)" :class="{disabled: fieldOptions.length === 1}">
									<i class="ccb-icon-close"></i>
								</div>
								<div class="ccb-option-inner label-input">
									<div class="ccb-input-wrapper">
										<span class="ccb-input-label"><?php esc_html_e( 'Label', 'cost-calculator-builder' ); ?></span>
										<input type="text" v-model="option.optionText" placeholder="<?php esc_attr_e( 'Option label', 'cost-calculator-builder' ); ?>">
									</div>
								</div>
								<div class="ccb-option-inner">
									<div class="ccb-input-wrapper">
										<span class="ccb-input-label">
											<?php esc_html_e( 'Value', 'cost-calculator-builder' ); ?>
											<span class="ccb-options-tooltip">
												<i class="ccb-icon-circle-question"></i>
												<span class="ccb-options-tooltip__text"><?php esc_html_e( 'This value can be used for calculation purposes, Use numbers only' ); ?></span>
											</span>
										</span>
										<input type="text" :name="'option_' + index" min="0" step="1" @keyup="checkRequired('errorOptionValue' + index)" v-model="option.optionValue" placeholder="<?php esc_attr_e( 'Value', 'cost-calculator-builder' ); ?>">
										<span @click="numberCounterActionForOption(index)" class="input-number-counter up"></span>
										<span @click="numberCounterActionForOption(index, '-')" class="input-number-counter down"></span>
									</div>
									<span :id="'errorOptionValue' + index"></span>
								</div>
								<div class="ccb-option-inner hint-input">
									<div class="ccb-input-wrapper">
										<span class="ccb-input-label"><?php esc_html_e( 'Hint', 'cost-calculator-builder' ); ?></span>
										<input type="text" v-model="option.optionHint" placeholder="<?php esc_attr_e( 'Option hint', 'cost-calculator-builder' ); ?>">
									</div>
								</div>
							</div>
						</draggable>
						<div class="ccb-option-actions">
							<button class="ccb-button light" @click.prevent="addOption">
								<i class="ccb-icon-Path-3453"></i>
								<?php esc_html_e( 'Add new', 'cost-calculator-builder' ); ?>
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15" v-if="errorsCount > 0">
				<div class="col-12">
					<div class="ccb-notice ccb-error">
						<span class="ccb-notice-title"><?php esc_html_e( 'Not Saved!', 'cost-calculator-builder' ); ?></span>
						<span class="ccn-notice-description"><?php esc_html_e( 'Options tab contains errors, check the fields!', 'cost-calculator-builder' ); ?></span>
					</div>
				</div>
			</div>
		</div>
		<div class="container" v-show="tab === 'style' && typeof radioField.styles !== 'undefined'">
			<?php if ( defined( 'CCB_PRO' ) ) : ?>
				<div class="row ccb-p-t-15" v-if="radioField.styles">
					<div class="col-12">
						<div class="ccb-field-style-tabs">
							<div class="ccb-field-style-tab" :class="{'active': radioField.styles.box_style === 'horizontal'}" @click="radioField.styles.box_style = 'horizontal'">
								<?php esc_html_e( 'Horizontal', 'cost-calculator-builder' ); ?>
							</div>
							<div class="ccb-field-style-tab" :class="{'active': radioField.styles.box_style === 'vertical'}" @click="radioField.styles.box_style = 'vertical'">
								<?php esc_html_e( 'Vertical', 'cost-calculator-builder' ); ?>
							</div>
						</div>
					</div>
				</div>

				<div class="row ccb-p-t-15" v-if="radioField.styles">
					<div class="col-12">
						<div class="ccb-style-preview ccb-field-style-preview" v-for="style in getRadioStyles" :key="style.value" :class="{'active': radioField.styles.style === style.value}" @click="radioField.styles.style = style.value">
							<span class="ccb-style-preview-header">{{ style.label }}</span>
							<img :src="style.img[radioField.styles.box_style]">
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15">
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="radioField.apply_style_for_all"/>
								<label></label>
							</div>
							<h6 style="font-size: 14px"><?php esc_html_e( 'Apply to All Radio Fields in Calculator', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
				</div>
			<?php else : ?>
				<div class="row ccb-p-t-15">
					<div class="calc-styles-pro-container">
						<div class="calc-styles-pro-header">
							<div class="calc-styles-pro-header-left">
							<span class="calc-styles-pro-icon-box">
								<i class="ccb-icon-Lock-filled"></i>
							</span>
								<span class="calc-styles-pro-header-box">
								<span class="ccb-heading-4 ccb-bold"><?php esc_html_e( 'Unlock PRO element styles', 'cost-calculator-builder' ); ?></span>
							</span>
							</div>
							<div class="calc-styles-pro-header-right">
								<a href="https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=radio_styles&licenses=1&billing_cycle=annual" target="_blank">
									<?php esc_html_e( 'Get Pro', 'cost-calculator-builder' ); ?>
								</a>
							</div>
						</div>
						<div class="calc-styles-pro-content">
							<img src="<?php echo esc_attr( CALC_URL . '/frontend/dist/img/styles/radio/radio-pro.gif' ); ?>">
						</div>
					</div>
				</div>
			<?php endif; ?>
		</div>
		<div class="container" v-show="tab === 'options'">
			<div class="row ccb-p-t-15 switch-row">
				<div class="col-12">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="radioField.allowCurrency"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Currency Sign', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<?php if ( ccb_pro_active() ) : ?>
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="radioField.required"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Required', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
				<?php endif; ?>
				<div class="col-12">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="radioField.allowRound"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Round Value', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<div class="col-12" v-if="!disableFieldHiddenByDefault(radioField)">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="radioField.hidden"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Hidden by Default', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<div class="col-12" v-if="!disableFieldHiddenByDefault(radioField)">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="radioField.calculateHidden"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Calculate hidden by default', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<div class="col-12">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="radioField.addToSummary"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Show in Grand Total', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<div class="col-12">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="radioField.fieldCurrency"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Add a measuring unit', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
			</div>
			<div class="row row-currency" :class="{'disabled': !radioField.fieldCurrency}">
				<div class="col-6 ccb-p-t-10">
					<div class="ccb-input-wrapper">
						<span class="ccb-input-label"><?php esc_html_e( 'Unit Symbol', 'cost-calculator-builder' ); ?></span>
						<input type="text" maxlength="18" v-model="fieldCurrency.currency" placeholder="<?php esc_attr_e( 'Enter unit symbol', 'cost-calculator-builder' ); ?>">
					</div>
				</div>
				<div class="col-6 ccb-p-t-10">
					<div class="ccb-select-box">
						<span class="ccb-select-label"><?php esc_html_e( 'Position', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-select-wrapper">
							<i class="ccb-icon-Path-3485 ccb-select-arrow"></i>
							<select class="ccb-select" v-model="fieldCurrency.currencyPosition">
								<option value="left"><?php esc_html_e( 'Left', 'cost-calculator-builder' ); ?></option>
								<option value="right"><?php esc_html_e( 'Right', 'cost-calculator-builder' ); ?></option>
								<option value="left_with_space"><?php esc_html_e( 'Left with space', 'cost-calculator-builder' ); ?></option>
								<option value="right_with_space"><?php esc_html_e( 'Right with space', 'cost-calculator-builder' ); ?></option>
							</select>
						</div>
					</div>
				</div>
				<div class="col-6 ccb-p-t-10">
					<div class="ccb-select-box">
						<span class="ccb-select-label"><?php esc_html_e( 'Thousands separator', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-select-wrapper">
							<i class="ccb-icon-Path-3485 ccb-select-arrow"></i>
							<select class="ccb-select" v-model="fieldCurrency.thousands_separator">
								<option value=","><?php esc_html_e( ' Comma ', 'cost-calculator-builder' ); ?></option>
								<option value="."><?php esc_html_e( ' Dot ', 'cost-calculator-builder' ); ?></option>
								<option value="'"><?php esc_html_e( ' Apostrophe ', 'cost-calculator-builder' ); ?></option>
								<option value=" "><?php esc_html_e( ' Space ', 'cost-calculator-builder' ); ?></option>
							</select>
						</div>
					</div>
				</div>
				<div class="col-6 ccb-p-t-10">
					<div class="ccb-input-wrapper number">
						<span class="ccb-input-label"><?php esc_html_e( 'Number of decimals', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-input-box">
							<input type="number" name="option_num_after_integer" v-model="fieldCurrency.num_after_integer" min="1" max="8" placeholder="<?php esc_attr_e( 'Enter decimals', 'cost-calculator-builder' ); ?>">
							<span class="input-number-counter up" @click="numberCounterAction('num_after_integer')"></span>
							<span class="input-number-counter down" @click="numberCounterAction('num_after_integer', '-')"></span>
						</div>
					</div>
				</div>
				<div class="col-6 ccb-p-t-10">
					<div class="ccb-select-box">
						<span class="ccb-select-label"><?php esc_html_e( 'Decimal separator', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-select-wrapper">
							<i class="ccb-icon-Path-3485 ccb-select-arrow"></i>
							<select class="ccb-select" v-model="fieldCurrency.decimal_separator">
								<option value=","><?php esc_html_e( ' Comma ', 'cost-calculator-builder' ); ?></option>
								<option value="."><?php esc_html_e( ' Dot ', 'cost-calculator-builder' ); ?></option>
							</select>
						</div>
					</div>
				</div>
			</div>	
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-input-wrapper">
						<span class="ccb-input-label"><?php esc_html_e( 'Additional Classes', 'cost-calculator-builder' ); ?></span>
						<textarea v-model="radioField.additionalStyles" placeholder="<?php esc_attr_e( 'Set Additional Classes', 'cost-calculator-builder' ); ?>"></textarea>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
