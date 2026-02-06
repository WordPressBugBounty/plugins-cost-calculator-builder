<div class="cbb-edit-field-container">
	<div class="ccb-edit-field-header">
		<div class="ccb-edit-field-header-left">
			<span class="ccb-edit-field-title ccb-heading-3 ccb-bold">{{ settingsField.general.header_title.length > 26 ? settingsField.general.header_title.substring(0, 26) + '...' : settingsField.general.header_title }}</span>
		</div>
		<div class="ccb-edit-field-header-right">
			<div class="ccb-save-wrapper">
				<button class="ccb-button" @click="closeTotalSummaryEdit"><?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?></button>
				<button class="ccb-button success" @click.prevent="saveTotalSummary"><?php esc_html_e( 'Done', 'cost-calculator-builder' ); ?></button>
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
						</div>
						<div class="ccb-edit-field-switch-item ccb-default-title" :class="{active: tab === 'settings'}" @click="tab = 'settings'">
							<?php esc_html_e( 'Settings', 'cost-calculator-builder' ); ?>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="container">
			<template v-if="tab === 'main'">
				<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-field-name">
						<div class="ccb-field-name__header">
							<div class="ccb-field-name__label"><?php esc_html_e( 'Summary title', 'cost-calculator-builder' ); ?></div>
						</div>
						<div class="ccb-field-name__body" style="flex-direction: row;">
							<input type="text" style="width: 70%" placeholder="<?php esc_attr_e( 'Enter summary title', 'cost-calculator-builder' ); ?>" v-model.trim="settingsField.general.header_title" />
							<div class="ccb-image-upload ccb-image-upload-section" style="width: 30%;">
								<input type="file" class="ccb-image-upload-input" ref="totalIconFile" @change="addImg('total', event)">
								<div class="ccb-image-upload-button-wrapper" v-if="!totalButtonDisable">
									<button class="ccb-image-upload-button" @click="chooseFile('totalIconFile')">
										<i class="ccb-icon-Add-Plus-Circle-filled"></i>
										<?php esc_html_e( 'Add icon', 'cost-calculator-builder' ); ?>
									</button>
								</div>
								<div class="ccb-loader" v-if="totalUploading"></div>
								<span class="ccb-image-upload-error" v-if="totalErrors"><?php esc_html_e( 'This file type is not supported', 'cost-calculator-builder' ); ?></span>
								<div class="ccb-image-upload-preview-wrapper" v-if="settingsField.general.icon_path" style="padding: 0;">
									<div class="ccb-image-upload-preview-inner" style="padding: 9px 8px 9px 12px;">
										<img :src="settingsField.general.icon_path" v-if="settingsField.general.icon_path" class="ccb-image-upload-preview" alt="Icon">
										<div class="ccb-image-upload-preview-remove" @click="clear()">
											<i class="remove ccb-icon-close" @click="clear()"></i>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
				<div class="row ccb-p-t-15">
					<div class="col">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="settingsField.general.descriptions" @change="toggleTotalOptions"/>
								<label></label>
							</div>
							<h6 class="ccb-heading-6 ccb-bold"><?php esc_html_e( 'Summary details', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
				</div>
				<div class="row ccb-settings-property ccb-sub-setting" :class="{ 'ccb-settings-disabled': !settingsField.general.descriptions }">
					<div class="col">
						<div class="row ccb-p-t-10">
							<div class="col">
								<div class="list-header">
									<div class="ccb-switch">
										<input type="checkbox" v-model="settingsField.general.hide_empty"/>
										<label></label>
									</div>
									<h6 class="ccb-heading-6 ccb-bold"><?php esc_html_e( 'Zero values in summary list', 'cost-calculator-builder' ); ?></h6>
								</div>
							</div>
						</div>
						<div class="row ccb-p-t-10">
							<div class="col">
								<div class="list-header">
									<div class="ccb-switch">
										<input type="checkbox" v-model="settingsField.general.hide_empty_for_orders_pdf_emails"/>
										<label></label>
									</div>
									<h6 class="ccb-heading-6 ccb-bold"><?php esc_html_e( 'Zero values in Orders, PDF Entries, Emails', 'cost-calculator-builder' ); ?></h6>
								</div>
							</div>
						</div>
						<div class="row ccb-p-t-10">
							<div class="col">
								<div class="list-header">
									<div class="ccb-switch">
										<input type="checkbox" v-model="settingsField.general.show_details_accordion"/>
										<label></label>
									</div>
									<h6 class="ccb-heading-6 ccb-bold"><?php esc_html_e( 'Details expanded by default', 'cost-calculator-builder' ); ?></h6>
									<span class="ccb-help-tip-block" style="margin-top: 2px;">
								<span class="ccb-help-label" ><?php esc_html_e( 'Preview', 'cost-calculator-builder' ); ?></span>
								<span class="ccb-help ccb-help-settings">
									<span class="ccb-help-content">
										<img src="<?php echo esc_url( CALC_URL . '/frontend/dist/img/total_summary.gif' ); ?>" alt="woo logo">
									</span>
								</span>
							</span>
								</div>
							</div>
						</div>
						<div class="row ccb-p-t-10 ccb-p-b-20">
							<div class="col">
								<div class="list-header">
									<div class="ccb-switch">
										<input type="checkbox" v-model="settingsField.general.show_option_unit"/>
										<label></label>
									</div>
									<h6 class="ccb-heading-6 ccb-bold"><?php esc_html_e( 'Cost breakdown in summary', 'cost-calculator-builder' ); ?></h6>
									<span class="ccb-help-tip-block" style="margin-top: 2px;">
								<span class="ccb-help-label" ><?php esc_html_e( 'Preview', 'cost-calculator-builder' ); ?></span>
								<span class="ccb-help ccb-help-settings">
									<span class="ccb-help-content">
										<img src="<?php echo esc_url( CALC_URL . '/frontend/dist/img/composition.jpg' ); ?>" alt="woo logo">
									</span>
								</span>
							</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
			<template v-if="tab === 'settings'">
				<?php if ( ccb_pro_active() ) : ?>
					<div class="row ccb-p-t-15">
						<div class="col">
							<div class="list-header">
								<div class="ccb-switch">
									<input type="checkbox" v-model="settingsField.general.sticky"/>
									<label></label>
								</div>
								<h6 class="ccb-heading-6 ccb-bold"><?php esc_html_e( 'Sticky Summary block', 'cost-calculator-builder' ); ?></h6>
								<span class="ccb-help-tip-block" style="margin-top: 2px;">
									<span class="ccb-help-label" ><?php esc_html_e( 'Preview', 'cost-calculator-builder' ); ?></span>
									<span class="ccb-help ccb-help-settings sticky">
										<span class="ccb-help-content">
											<img src="<?php echo esc_url( CALC_URL . '/frontend/dist/img/sticky.gif' ); ?>" alt="woo logo">
										</span>
									</span>
								</span>
							</div>
						</div>
					</div>
				<?php else : ?>
					<div class="row ccb-p-t-10 section-border-top">
						<div class="col">
							<div class="list-header">
								<div class="ccb-switch" style="pointer-events: none">
									<input type="checkbox"/>
									<label></label>
								</div>
								<h6 class="ccb-heading-6 ccb-bold" style="color: #9196A1; display: flex">
									<span><?php esc_html_e( 'Sticky Summary block', 'cost-calculator-builder' ); ?></span>
									<span class="ccb-item-lock-inner" style="left: 0px;"><i class="ccb-icon-Path-3482"></i> <span>PRO</span></span>
								</h6>
								<span class="ccb-help-tip-block" style="margin-top: 2px;">
									<span class="ccb-help-label" ><?php esc_html_e( 'Preview', 'cost-calculator-builder' ); ?></span>
									<span class="ccb-help ccb-help-settings">
										<span class="ccb-help-content">
											<img src="<?php echo esc_url( CALC_URL . '/frontend/dist/img/sticky.gif' ); ?>" alt="woo logo">
										</span>
									</span>
								</span>
							</div>
						</div>
					</div>
				<?php endif; ?>
			</template>
		</div>
	</div>
</div>
