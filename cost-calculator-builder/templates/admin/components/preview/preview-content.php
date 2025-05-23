<?php
$calc_id          = $_GET['id'] ?? '';
$default_img      = CALC_URL . '/frontend/dist/img/default.png';
$general_settings = \cBuilder\Classes\CCBSettingsData::get_calc_global_settings();
$settings         = \cBuilder\Classes\CCBSettingsData::get_calc_single_settings( $calc_id );
$get_date_format  = get_option( 'date_format' );
?>

<div :id="getId">
	<div :class="'ccb-wrapper-' + getId">
		<div ref="calc" :class="['calc-container', {[boxStyle]: preview !== 'mobile'}]" :data-calc-id="getId">
			<loader v-if="loader"></loader>
			<template>
				<div class="calc-fields calc-list calc-list__indexed" :class="{loaded: !loader, 'payment' :  getHideCalc}" v-if="!loader">
					<div class="calc-list-inner">
						<div class="calc-item-title">
							<div class="ccb-calc-heading">{{ getTitle }}</div>
						</div>

						<div v-if="calc_data" class="calc-fields-container">
							<template v-for="field in calc_data.fields">
								<template v-if="field && field.alias && field.type !== 'Total' && !field.alias.includes('group')">
									<component
											text-days="<?php esc_attr_e( 'days', 'cost-calculator-builder' ); ?>"
											v-if="fields[field.alias] && !field.group_id"
											:is="field._tag"
											:id="calc_data.id"
											:field="field"
											:is_preview="true"
											v-model="fields[field.alias].value"
											v-on:change="change"
											v-on:[field._event]="change"
											format="<?php esc_attr( $get_date_format ); ?>"
											:disabled="fields[field.alias].disabled"
											:key="!field.hasNextTick ? field.alias : field.alias + '_' + fields[field.alias].nextTickCount"
									>
									</component>
								</template>
								<template v-if="field.alias && field.alias.includes('group')">
									<component
											format="<?php esc_attr( $get_date_format ); ?>"
											text-days="<?php esc_attr_e( 'days', 'cost-calculator-builder' ); ?>"
											v-if="fields[field.alias] && !field.group_id"
											:is="field._tag"
											:id="calc_data.id"
											:field="field"
											:disabled="fields[field.alias].disabled"
											v-model="fields[field.alias].value"
											v-on:change="change"
											v-on:[field._event]="change"
											:key="!field.hasNextTick ? field.alias : field.alias + '_' + fields[field.alias].nextTickCount"
									>
										<slot>
											<template v-for="element in calc_data.fields">
												<component
														format="<?php esc_attr( $get_date_format ); ?>"
														text-days="<?php esc_attr_e( 'days', 'cost-calculator-builder' ); ?>"
														v-if="fields[element.alias] && element.group_id === field.alias"
														:is="element._tag"
														:id="calc_data.id"
														:field="element"
														:disabled="fields[element.alias].disabled"
														v-model="fields[element.alias].value"
														v-on:change="change"
														v-on:[element._event]="change"
														:key="!element.hasNextTick ? element.alias : element.alias + '_' + fields[element.alias].nextTickCount"
												>
												</component>
											</template>
										</slot>
									</component>
								</template>
								<template v-else-if="field && !field.alias && field.type !== 'Total'">
									<component
											:id="calc_data.id"
											style="boxStyle"
											:is="field._tag"
											:field="field"
									>
									</component>
								</template>
							</template>
						</div>
					</div>
				</div>
				<div class="calc-subtotal calc-list" :id="getStickyData" :class="{loaded: !loader}">
					<div class="calc-list-inner">
						<div class="calc-item-title calc-accordion" v-show="!summaryDisplay">
							<div class="ccb-calc-heading">{{ getHeaderTitle }}</div>
							<span class="calc-accordion-btn" @click="toggleAccordionAction" :style="{display: settings.general && settings.general.descriptions ? 'flex': 'none'}">
								<i class="ccb-icon-Path-3485" :style="{top: '1px', transform: !accordionState ? 'rotate(0)' : 'rotate(180deg)'}"></i>
							</span>
						</div>

						<div class="calc-item-title calc-accordion" style="margin: 0 !important;" v-show="summaryDisplay">
							<div class="ccb-calc-heading" style="text-transform: none !important;" v-text="summaryDisplaySettings?.form_title"></div>
						</div>

						<div class="calc-subtotal-list" :class="{ 'show-unit': showUnitInSummary }" v-show="!summaryDisplay">
							<transition>
								<div class="calc-subtotal-list-accordion" :class="{hidden: !accordionState}">
									<div class="calc-subtotal-list-header" v-if="showUnitInSummary">
										<span class="calc-subtotal-list-header__name"><?php esc_html_e( 'Name', 'cost-calculator-builder' ); ?></span>

										<span class="calc-subtotal-list-header__value"><?php esc_html_e( 'Total', 'cost-calculator-builder' ); ?></span>
									</div>
									<template v-for="(field) in getTotalSummaryFields" v-if="(!field.inRepeater || field.alias.includes('repeater')) && field.alias.indexOf('total') === -1 && settings && settings.general.descriptions">
										<template v-if="field.alias.includes('repeater')">
											<div class="calc-repeater-subtotal" v-for="(f, idx) in Object.values(field?.resultGrouped)">
												<template v-if="getRepeaterFields(f)?.length">
													<div class="calc-repeater-subtotal-header" :data-index="idx">
														<i class="ccb-icon-Path-3514"></i>
														<span>{{field.label}}</span>
														<span class="ccb-repeater-field-number">#{{idx + 1}}</span>
													</div>
													<div class="calc-repeater-subtotal-fields" :data-index="idx">
														<template v-for="(innerField) in getRepeaterFields(f)">
															<calc-total-summary :field="innerField" :style="{'padding-top': '6px'}"></calc-total-summary>
															<calc-total-summary :field="innerField" :unit="true" v-if="innerField.option_unit" :style="{'padding-top': '5px'}"></calc-total-summary>
															<calc-total-summary :field="innerField" :style="{'padding-top': '5px'}" :multi="true" v-if="['checkbox', 'toggle', 'checkbox_with_img'].includes(innerField.alias.replace(/\_field_id.*/,'')) && innerField.options?.length"></calc-total-summary>
														</template>
													</div>
												</template>
											</div>
										</template>
										<template v-else>
											<calc-total-summary :field="field"></calc-total-summary>
											<template v-if="field.option_unit">
												<template v-if="field.hasOwnProperty('allowPrice')">
													<calc-total-summary :field="field" :unit="true" v-if="field.allowPrice"></calc-total-summary>
												</template>
												<template v-else>
													<calc-total-summary :field="field" :unit="true"></calc-total-summary>
												</template>
											</template>
											<calc-total-summary :field="field" :multi="true" v-if="['checkbox', 'toggle', 'checkbox_with_img'].includes(field.alias.replace(/\_field_id.*/,'')) && field.options?.length"></calc-total-summary>
										</template>
									</template>
								</div>
							</transition>
						</div>
						<div class="calc-promocode-wrapper" v-if="hasPromocode">
							<div class="promocode-header"></div>
							<div class="promocode-body">
								<div class="calc-have-promocode">
									<span><?php esc_html_e( 'Have a promocode?', 'cost-calculator-builder' ); ?></span>
								</div>
								<div class="calc-item ccb-field ccb-field-quantity">
									<div class="calc-item__title" style="display: flex; align-items: center; column-gap: 10px">
										<span><?php esc_html_e( 'Promocode', 'cost-calculator-builder' ); ?></span>
										<span class="ccb-promocode-hint" v-if="showPromocode" @click.stop="showPromocode = !showPromocode"><?php esc_html_e( 'Hide', 'cost-calculator-builder' ); ?></span>
										<span class="ccb-promocode-hint" v-if="!showPromocode" @click.stop="showPromocode = !showPromocode"><?php esc_html_e( 'Show', 'cost-calculator-builder' ); ?></span>
									</div>
									<template v-if="showPromocode">
										<div class="calc-promocode-container">
											<div class="calc-input-wrapper ccb-field" :class="{required: discountError !== ''}">
												<span v-if="discountError === 'invalid'" :class="{active: discountError !== ''}" class="ccb-error-tip front default"><?php esc_html_e( 'Invalid promocode', 'cost-calculator-builder' ); ?></span>
												<span v-if="discountError === 'not_exist'" :class="{active: discountError !== ''}" class="ccb-error-tip front default"><?php esc_html_e( 'Promocode not exists', 'cost-calculator-builder' ); ?></span>
												<input type="text" v-model="promocode" @input="discountError = ''" class="calc-input ccb-field ccb-appearance-field">
											</div>
											<button class="calc-btn-action ispro-wrapper success" @click.stop="applyPromocode">
												<span><?php esc_html_e( 'Apply', 'cost-calculator-builder' ); ?></span>
											</button>
										</div>

										<div class="calc-applied" v-if="usedPromocodes?.length">
											<span class="calc-applied-title"><?php esc_html_e( 'Applied promocodes:', 'cost-calculator-builder' ); ?></span>
											<div class="ccb-promocodes-list">
												<span v-for="promocode in usedPromocodes" class="ccb-promocode">
													{{ promocode }}
													<i @click.stop="removePromocode(promocode)" class="remove ccb-icon-close"></i>
												</span>
											</div>
										</div>
									</template>
								</div>
							</div>
						</div>

						<div class="calc-subtotal-list">
							<?php if ( ccb_pro_active() ) : ?>
								<cost-pro-features inline-template :settings="preview_data.settings">
									<?php echo \cBuilder\Classes\CCBProTemplate::load( 'admin/pro-features', array( 'settings' => $settings, 'general_settings' => $general_settings, 'invoice' => $general_settings['invoice'] ?? array() ) ); // phpcs:ignore ?>
								</cost-pro-features>
							<?php endif; ?>
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</div>
