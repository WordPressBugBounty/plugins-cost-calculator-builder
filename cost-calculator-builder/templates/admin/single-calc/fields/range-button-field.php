<div class="cbb-edit-field-container range-field-edit">
	<div class="ccb-edit-field-header">
		<div class="ccb-edit-field-header-left">
			<span class="ccb-edit-field-title ccb-heading-3 ccb-bold">{{ getFieldTitle(rangeField) || "Basic slider" }}</span>
		</div>
		<div class="ccb-edit-field-header-right">
			<div class="ccb-save-wrapper">
				<button class="ccb-button" @click.prevent="$emit( 'cancel' )"><?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?></button>
				<button class="ccb-button success" @click.prevent="save(rangeField, id, index, rangeField.alias)"><?php esc_html_e( 'Done', 'cost-calculator-builder' ); ?></button>
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
						<div class="ccb-edit-field-switch-item ccb-default-title" :class="{active: tab === 'style'}" @click="tab = 'style'">
							<?php esc_html_e( 'Variants', 'cost-calculator-builder' ); ?>
						</div>
						<div class="ccb-edit-field-switch-item ccb-default-title" :class="{active: tab === 'options'}" @click="tab = 'options'">
							<?php esc_html_e( 'Settings', 'cost-calculator-builder' ); ?>
						</div>
					</div>
				</div>
			</div>

			<template v-if="tab === 'main'">
				<div class="row ccb-p-t-15">
					<div class="col-12">
						<div class="ccb-field-name">
							<div class="ccb-field-name__header">
								<div class="ccb-field-name__label"><?php esc_html_e( 'Element name', 'cost-calculator-builder' ); ?></div>
								<div class="ccb-field-name__id">{{ rangeField.alias }}</div>
							</div>
							<div class="ccb-field-name__body">
								<input type="text" placeholder="<?php esc_attr_e( 'Enter field name', 'cost-calculator-builder' ); ?>" v-model.trim="rangeField.label">
								<input type="text" placeholder="<?php esc_attr_e( 'Enter field description', 'cost-calculator-builder' ); ?>" v-model.trim="rangeField.description">
							</div>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15">
					<div class="col-12">
						<div class="ccb-builder-radio-wrapper">
							<span class="ccb-radio-label"><?php esc_html_e( 'Element Width (%)', 'cost-calculator-builder' ); ?></span>
							<div class="ccb-radio-box">
								<input class="ccb-builder-radio__radio" :id="'ccb-width-25-' + rangeField.alias" type="radio" :name="'width-' + rangeField.alias" value="25" v-model="rangeField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 25 } }))">
								<label class="ccb-builder-radio__option" :for="'ccb-width-25-' + rangeField.alias"><?php esc_html_e( '25', 'cost-calculator-builder' ); ?></label>

								<input class="ccb-builder-radio__radio" :id="'ccb-width-50-' + rangeField.alias" type="radio" :name="'width-' + rangeField.alias" value="50" v-model="rangeField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 50 } }))">
								<label class="ccb-builder-radio__option" :for="'ccb-width-50-' + rangeField.alias"><?php esc_html_e( '50', 'cost-calculator-builder' ); ?></label>

								<input class="ccb-builder-radio__radio" :id="'ccb-width-75-' + rangeField.alias" type="radio" :name="'width-' + rangeField.alias" value="75" v-model="rangeField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 75 } }))">
								<label class="ccb-builder-radio__option" :for="'ccb-width-75-' + rangeField.alias"><?php esc_html_e( '75', 'cost-calculator-builder' ); ?></label>

								<input class="ccb-builder-radio__radio" :id="'ccb-width-100-' + rangeField.alias" type="radio" :name="'width-' + rangeField.alias" value="100" v-model="rangeField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 100 } }))">
								<label class="ccb-builder-radio__option" :for="'ccb-width-100-' + rangeField.alias"><?php esc_html_e( '100', 'cost-calculator-builder' ); ?></label>
							</div>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15">
					<div class="col-6">
						<div class="ccb-input-wrapper number">
							<span class="ccb-input-label"><?php esc_html_e( 'Minimum Range Value', 'cost-calculator-builder' ); ?></span>
							<div class="ccb-input-box">
								<input type="text" :class="{'ccb-input-required': isObjectHasPath(errors, ['minValue'] ) && errors.minValue}" name="minValue" min="0" step="1" @input="() => fixErrorByKey('minValue')" v-model="rangeField.minValue" placeholder="<?php esc_attr_e( 'Enter min range', 'cost-calculator-builder' ); ?>">
								<span @click="numberCounterAction('minValue')" class="input-number-counter up"></span>
								<span @click="numberCounterAction('minValue', '-')" class="input-number-counter down"></span>
							</div>
							<span class="ccb-error-tip default" v-if="isObjectHasPath(errors, ['minValue'] ) && errors.minValue" v-html="errors.minValue"></span>
						</div>
					</div>
					<div class="col-6">
						<div class="ccb-input-wrapper number">
							<span class="ccb-input-label"><?php esc_html_e( 'Maximum Range Value', 'cost-calculator-builder' ); ?></span>
							<div class="ccb-input-box">
								<input type="text" :class="{'ccb-input-required': isObjectHasPath(errors, ['maxValue'] ) && errors.maxValue}" name="maxValue" min="0"  step="1" @input="() => fixErrorByKey('maxValue')" v-model="rangeField.maxValue" placeholder="<?php esc_attr_e( 'Enter max range', 'cost-calculator-builder' ); ?>">
								<span @click="numberCounterAction('maxValue')" class="input-number-counter up"></span>
								<span @click="numberCounterAction('maxValue', '-')" class="input-number-counter down"></span>
							</div>
							<span class="ccb-error-tip default" v-if="isObjectHasPath(errors, ['maxValue'] ) && errors.maxValue" v-html="errors.maxValue"></span>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15">
					<div class="col-6">
						<div class="ccb-input-wrapper number" :class="{ 'disabled': rangeField.jump && rangeField.styles.style !== 'default' }">
							<span class="ccb-input-label"><?php esc_html_e( 'Range Step', 'cost-calculator-builder' ); ?></span>
							<div class="ccb-input-box">
								<input type="text" :class="{'ccb-input-required': isObjectHasPath(errors, ['step'] ) && errors.step}" name="step" min="0" step="1" @input="() => fixErrorByKey('step')" v-model="rangeField.step" placeholder="<?php esc_attr_e( 'Enter step', 'cost-calculator-builder' ); ?>">
								<span @click="numberCounterAction('step')" class="input-number-counter up"></span>
								<span @click="numberCounterAction('step', '-')" class="input-number-counter down"></span>
							</div>
							<span class="ccb-error-tip default" v-if="isObjectHasPath(errors, ['step'] ) && errors.step" v-html="errors.step"></span>
						</div>
					</div>
					<div class="col-6">
						<div class="ccb-input-wrapper number">
							<span class="ccb-input-label"><?php esc_html_e( 'Default Range Value', 'cost-calculator-builder' ); ?></span>
							<div class="ccb-input-box">
								<input type="text" name="default" min="0" step="1" @input="errors.default=false" v-model="rangeField.default" placeholder="<?php esc_attr_e( 'Enter default value', 'cost-calculator-builder' ); ?>">
								<span @click="numberCounterAction('default')" class="input-number-counter up"></span>
								<span @click="numberCounterAction('default', '-')" class="input-number-counter down"></span>
							</div>
							<span class="ccb-error-tip default" v-if="isObjectHasPath(errors, ['default'] ) && errors.default" v-html="errors.default"></span>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15">
					<div class="col-12" v-if="rangeField.styles.style !== 'input' && rangeField.styles.style !== 'default'" style="position: relative;">
						<div class="ccb-input-wrapper">
							<span class="ccb-input-label" style="position: relative;">
								<?php esc_html_e( 'Slider Scale Points', 'cost-calculator-builder' ); ?>
								<span class="ccb-options-tooltip" style="position: absolute; top: -3px; right: -26px;">
									<i class="ccb-icon-circle-question"></i>
								<span class="ccb-options-tooltip__text"><?php esc_html_e( 'Define the specific data points that will be highlighted in a slider. Enter values separated by commas. Use dots for decimal numbers. Example: 7.5 , 10, 13.5' ); ?></span>
							</span>
							</span>
							<input type="text" maxlength="100" v-model.trim="rangeField.scalePoints" placeholder="<?php esc_attr_e( 'Enter scale points', 'cost-calculator-builder' ); ?>">						</div>
						<span class="ccb-error-tip default" v-if="isObjectHasPath(errors, ['scalePoints'] ) && errors.scalePoints" v-html="errors.scalePoints"></span>
					</div>
				</div>
				<div class="row ccb-p-t-15">
					<div class="col-6">
						<div class="ccb-input-wrapper" :class="{ 'disabled': !rangeField.multiply && rangeField.allowCurrency || rangeField.fieldCurrency }">
							<span class="ccb-input-label"><?php esc_html_e( 'Name of value (kg, gr, pcs)', 'cost-calculator-builder' ); ?></span>
							<input type="text" maxlength="18" v-model.trim="rangeField.sign" placeholder="<?php esc_attr_e( 'Enter unit symbol', 'cost-calculator-builder' ); ?>">
						</div>
					</div>
					<div class="col-6">
						<div class="ccb-disable-msg" v-if="!rangeField.multiply && rangeField.allowCurrency">
							<span><?php esc_html_e( 'Currency sign is ON', 'cost-calculator-builder' ); ?></span>
						</div>
						<div class="ccb-select-box" style="padding-top: 27px;" v-else>
							<div class="ccb-select-wrapper">
								<i class="ccb-icon-Path-3485 ccb-select-arrow"></i>
								<select class="ccb-select" v-model="rangeField.unitPosition">
									<option value="right" selected><?php esc_html_e( 'On the right', 'cost-calculator-builder' ); ?></option>
									<option value="left"><?php esc_html_e( 'On the left', 'cost-calculator-builder' ); ?></option>
								</select>
							</div>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15">
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.multiply" @change="rangeField.multiply && (rangeField.pricingStructure = 'no_discounts')"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Multiply by Unit Price', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
					<div class="col-12 ccb-p-t-10" v-if="rangeField.styles.style !== 'input' && rangeField.styles.style !== 'default'">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.jump"/>
								<label></label>
							</div>
							<h6 style="position: relative;">
								<?php esc_html_e( 'Jump between scale points', 'cost-calculator-builder' ); ?>
								<span class="ccb-options-tooltip" style="position: absolute; top: -3px; right: -26px;">
									<i class="ccb-icon-circle-question"></i>
								<span class="ccb-options-tooltip__text"><?php esc_html_e( 'When enabled, the slider will snap to the defined scale points, preventing users from selecting in-between values.' ); ?></span>
							</h6>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15" v-if="rangeField.multiply">
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-multiply">
								<span class="ccb-multiply__bg">=</span>
								<span class="ccb-multiply__bg" style="font-size: 11px; padding: 4px;"><?php esc_html_e( 'Selected value', 'cost-calculator-builder' ); ?></span>
								<span class="ccb-multiply__icon"><i class="ccb-icon-close"></i></span>
								<div class="ccb-input-wrapper number">
									<div class="ccb-input-box">
										<input type="text" name="unit" min="0" step="1" :class="{'ccb-input-required': isObjectHasPath(errors, ['unit'] ) && errors.unit}" v-model="rangeField.unit" placeholder="<?php esc_attr_e( 'Enter unit', 'cost-calculator-builder' ); ?>">
										<span @click="numberCounterAction('unit')" class="input-number-counter up"></span>
										<span @click="numberCounterAction('unit', '-')" class="input-number-counter down"></span>
									</div>
									<span class="ccb-error-tip default" v-if="isObjectHasPath(errors, ['unit'] ) && errors.unit" v-html="errors.unit"></span>
								</div>
								<div class="ccb-input-wrapper" style="margin-left: 10px; width: 160px;" :class="{'disabled': rangeField.fieldCurrency || rangeField.allowCurrency }">
									<input type="text" maxlength="18" v-model.trim="rangeField.unitSymbol" placeholder="<?php esc_attr_e( 'Unit (kg, cm,...)', 'cost-calculator-builder' ); ?>">
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15 switch-row" v-if="rangeField.multiply">
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.multipliedTotal"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Replace Subtotal with Multiplied Value', 'cost-calculator-builder' ); ?></h6>
							<span class="ccb-help-tip-block" style="margin-top: 2px;">
								<span class="ccb-help-label ccb-help-label-range" ><?php esc_html_e( 'Preview', 'cost-calculator-builder' ); ?></span>
								<span class="ccb-help ccb-help-settings" style="left: -130px; bottom: 20px;">
									<span class="ccb-help-content">
										<img src="<?php echo esc_url( CALC_URL . '/frontend/dist/img/preview/range.png' ); ?>" alt="Show multiplied value instead of subtotal">
									</span>
								</span>
							</span>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-30">
					<div class="col-12">
						<div class="ccb-select-box">
							<div class="ccb-select-label-wrapper">
								<span class="ccb-select-label"><?php esc_html_e( 'Pricing Structure', 'cost-calculator-builder' ); ?></span>
								<?php if ( ! defined( 'CCB_PRO' ) ) : ?>
									<a style="outline: none; text-decoration: none; box-shadow: none;" href="https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcadmin&utm_medium=rangepro&utm_campaign=pricingstructure" target="_blank">
										<span class="ccb-pricing-in-pro-badge">
											<i class="ccb-icon-Lock-filled"></i>
											<span><?php esc_html_e( 'PRO', 'cost-calculator-builder' ); ?></span>
										</span>
									</a>
								<?php endif; ?>
							</div>
							<div class="ccb-select-wrapper">
								<i class="ccb-icon-Path-3485 ccb-select-arrow"></i>
								<select :class="{'disabled': rangeField.multiply}" class="ccb-select <?php echo ! defined( 'CCB_PRO' ) ? 'disabled' : ''; ?>" v-model="rangeField.pricingStructure">
									<option value="no_discounts" selected><?php esc_html_e( 'Default', 'cost-calculator-builder' ); ?></option>
									<option value="tiered_discounts"><?php esc_html_e( 'All Units Pricing', 'cost-calculator-builder' ); ?></option>
									<option value="cumulative_discounts"><?php esc_html_e( 'Tiered Pricing', 'cost-calculator-builder' ); ?></option>
									<option value="flat_rate_discounts"><?php esc_html_e( 'Flat Unit Price per Range', 'cost-calculator-builder' ); ?></option>
								</select>
							</div>
						</div>
						<div class="ccb-edit-field-info" style="margin-top: 5px;">
							<a class="ccb-documentation-link" href="https://docs.stylemixthemes.com/cost-calculator-builder/calculator-elements/range-button#pricing-structure" target=”_blank”><?php esc_html_e( 'How does it work?', 'cost-calculator-builder' ); ?></a>
						</div>
					</div>
				</div>
				<div class="row ccb-p-t-15 <?php echo ! defined( 'CCB_PRO' ) ? 'disabled' : ''; ?>" v-if="rangeField.pricingStructure !== 'no_discounts' && !rangeField.multiply">
					<div class="col-12">
						<div class="ccb-input-wrapper pricing-structure">
							<div class="ccb-price-range">
								<div class="ccb-price-range-header">
									<div class="ccb-price-range-header__title"><?php esc_html_e( 'Pricing Range', 'cost-calculator-builder' ); ?></div>
									<div class="ccb-price-range-header__title"><?php esc_html_e( 'Unit Price', 'cost-calculator-builder' ); ?></div>
								</div>
								<div class="ccb-price-rows">
									<div class="ccb-price-row" v-for="(r, idx) in rangeField.pricingRanges" :key="idx">
										<div class="ccb-price-range-row-left">
											<div class="ccb-price-range-from">from {{ r.minQty }} to</div>
											<div class="ccb-input-wrapper">
												<input type="number" class="ccb-heading-5 ccb-light" name="maxQty" v-model.r="r.maxQty" @blur="clampPricingRange(idx, 'maxQty', $event)">
											</div>
										</div>
										<div class="ccb-price-range-row-right">
											<div class="ccb-input-wrapper">
												<input type="number" class="ccb-heading-5 ccb-light" name="unitPrice" v-model.r="r.unitPrice" placeholder="<?php esc_attr_e( 'Enter value', 'cost-calculator-builder' ); ?>">
											</div>
											<div class="ccb-price-range-info"><span class="title">{{ getCalcCurrentCurrency }}</span></div>
											<div class="ccb-price-range-delete" @click="removePricingRange(idx)" v-if="idx != 0 && idx == rangeField.pricingRanges.length - 1">
												<i class="ccb-icon-close"></i>
											</div>
										</div>
									</div>
									<div class="ccb-price-range-action">
										<button class="ccb-button" @click="addPricingRange()" :disabled="!canAddPricingRange">
											<i class="ccb-icon-plus-lite"></i>
											<span><?php esc_html_e( 'Add another range', 'cost-calculator-builder' ); ?></span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="col-12 ccb-p-t-15">
						<div class="ccb-input-wrapper">
							<span class="ccb-input-label"><?php esc_html_e( 'Badge Text', 'cost-calculator-builder' ); ?></span>
							<input type="text" v-model.trim="rangeField.badgeText" placeholder="<?php esc_attr_e( 'Enter badge text', 'cost-calculator-builder' ); ?>">
						</div>
					</div>
					<div class="col-12 ccb-p-t-15">
						<div class="ccb-builder-radio-wrapper">
							<span class="ccb-radio-label"><?php esc_html_e( 'Format', 'cost-calculator-builder' ); ?></span>
							<div class="ccb-radio-box">
								<input class="ccb-builder-radio__radio" :id="'ccb-percent-' + rangeField.alias" type="radio" :name="'ccb-percent-' + rangeField.alias" value="percent" v-model="rangeField.badgeFormat">
								<label class="ccb-builder-radio__option" :for="'ccb-percent-' + rangeField.alias">%</label>

								<input class="ccb-builder-radio__radio" :id="'ccb-symbol-' + rangeField.alias" type="radio" :name="'ccb-symbol-' + rangeField.alias" value="symbol" v-model="rangeField.badgeFormat">
								<label class="ccb-builder-radio__option" :for="'ccb-symbol-' + rangeField.alias">{{ getCalcCurrentCurrency }}</label>

								<input class="ccb-builder-radio__radio" :id="'ccb-symbol-and-percent-' + rangeField.alias" type="radio" :name="'ccb-symbol-and-percent-' + rangeField.alias" value="symbol_and_percent" v-model="rangeField.badgeFormat">
								<label class="ccb-builder-radio__option" :for="'ccb-symbol-and-percent-' + rangeField.alias">{{ getCalcCurrentCurrency }} + %</label>
							</div>
						</div>
					</div>
					<div class="col-12 ccb-p-t-15">
						<div class="ccb-builder-radio-wrapper">
							<span class="ccb-radio-label"><?php esc_html_e( 'Variants', 'cost-calculator-builder' ); ?></span>
							<div class="ccb-radio-box">
								<input class="ccb-builder-radio__radio" :id="'ccb-outlined-' + rangeField.alias" type="radio" :name="'ccb-outlined-' + rangeField.alias" value="outlined" v-model="rangeField.badgeVariant">
								<label class="ccb-builder-radio__option" :for="'ccb-outlined-' + rangeField.alias"><?php esc_html_e( 'Outlined', 'cost-calculator-builder' ); ?></label>

								<input class="ccb-builder-radio__radio" :id="'ccb-primary-' + rangeField.alias" type="radio" :name="'ccb-primary-' + rangeField.alias" value="primary" v-model="rangeField.badgeVariant">
								<label class="ccb-builder-radio__option" :for="'ccb-primary-' + rangeField.alias"><?php esc_html_e( 'Primary', 'cost-calculator-builder' ); ?></label>

								<input class="ccb-builder-radio__radio" :id="'ccb-solid-' + rangeField.alias" type="radio" :name="'ccb-solid-' + rangeField.alias" value="solid" v-model="rangeField.badgeVariant">
								<label class="ccb-builder-radio__option" :for="'ccb-solid-' + rangeField.alias"><?php esc_html_e( 'Solid', 'cost-calculator-builder' ); ?></label>
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
			</template>
			<template v-if="tab === 'style'">
				<?php if ( defined( 'CCB_PRO' ) ) : ?>
					<div class="row ccb-p-t-15" v-if="rangeField.styles">
						<div class="col-12">
							<div class="ccb-style-preview ccb-field-style-preview" v-for="style in getRangeStyles" :key="style.value" :class="{'active': rangeField.styles.style === style.value}" @click="rangeField.styles.style = style.value">
								<span class="ccb-style-preview-header">{{ style.label }}</span>
								<img :src="style.img">
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
									<a href="https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=range_styles&licenses=1&billing_cycle=annual" target="_blank">
										<?php esc_html_e( 'Get Pro', 'cost-calculator-builder' ); ?>
									</a>
								</div>
							</div>
							<div class="calc-styles-pro-content">
								<img src="<?php echo esc_attr( CALC_URL . '/frontend/dist/img/styles/checkbox/checkbox-pro.gif' ); ?>">
							</div>
						</div>
					</div>
				<?php endif; ?>
			</template>
			<template v-if="tab === 'options'">
				<div class="row ccb-p-t-15 switch-row">
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.allowCurrency"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Currency Sign', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.allowRound"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Round Value', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
					<div class="col-12" v-if="!disableFieldHiddenByDefault(rangeField)">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.hidden"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Hidden by Default', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
					<div class="col-12" v-if="!disableFieldHiddenByDefault(rangeField)">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.calculateHidden"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Calculate hidden by default', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.addToSummary"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Show in Grand Total', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
					<?php if ( ccb_pro_active() ) : ?>
						<div class="col-12">
							<div class="list-header">
								<div class="ccb-switch">
									<input type="checkbox" v-model="rangeField.required"/>
									<label></label>
								</div>
								<h6><?php esc_html_e( 'Required', 'cost-calculator-builder' ); ?></h6>
							</div>
						</div>
					<?php endif; ?>
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="rangeField.fieldCurrency"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Add a measuring unit', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
					</div>
					<div class="row row-currency" :class="{'disabled': !rangeField.fieldCurrency}">
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
							<textarea v-model="rangeField.additionalStyles" placeholder="<?php esc_attr_e( 'Set Additional Classes', 'cost-calculator-builder' ); ?>"></textarea>
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</div>
