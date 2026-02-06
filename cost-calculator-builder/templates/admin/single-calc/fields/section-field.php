<div class="cbb-edit-field-container">
	<div class="ccb-edit-field-header">
		<div class="ccb-edit-field-header-left">
			<span class="ccb-edit-field-title ccb-heading-3 ccb-bold">{{ getFieldTitle(sectionField) }}</span>
		</div>
		<div class="ccb-edit-field-header-right">
			<div class="ccb-save-wrapper">
				<button class="ccb-button" @click.prevent="$emit( 'cancel' )"><?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?></button>
				<button class="ccb-button success" @click.prevent="$emit('save',sectionField, id, index, sectionField.alias)"><?php esc_html_e( 'Done', 'cost-calculator-builder' ); ?></button>
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
						<div class="ccb-edit-field-switch-item ccb-default-title" :class="{active: tab === 'styles'}" @click="tab = 'styles'">
							<?php esc_html_e( 'Variants', 'cost-calculator-builder' ); ?>
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
							<div class="ccb-field-name__id">{{ sectionField.alias }}</div>
						</div>
						<div class="ccb-field-name__body" style="flex-direction: row;">
							<input type="text" style="width: 70%" placeholder="<?php esc_attr_e( 'Enter field name', 'cost-calculator-builder' ); ?>" v-model.trim="sectionField.label" />
							<div class="ccb-image-upload ccb-image-upload-section" style="width: 30%;">
								<input type="file" class="ccb-image-upload-input" ref="sectionref" @change="addImg('section', event)">
								<div class="ccb-image-upload-button-wrapper" v-if="!sectionButtonDisable">
									<button class="ccb-image-upload-button" @click="chooseFile('sectionref')">
										<i class="ccb-icon-Add-Plus-Circle-filled"></i>
										<?php esc_html_e( 'Add icon', 'cost-calculator-builder' ); ?>
									</button>
								</div>
								<div class="ccb-loader" v-if="sectionUploading"></div>
								<span class="ccb-image-upload-error" v-if="sectionErrors"><?php esc_html_e( 'This file type is not supported', 'cost-calculator-builder' ); ?></span>
								<div class="ccb-image-upload-preview-wrapper" v-if="sectionIconPath" style="padding: 0;">
									<div class="ccb-image-upload-preview-inner" style="padding: 9px 8px 9px 12px;">
										<img :src="sectionIconPath" v-if="sectionIconPath" class="ccb-image-upload-preview" alt="Icon">
										<div class="ccb-image-upload-preview-remove" @click="clear('section')">
											<i class="remove ccb-icon-close"></i>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-12 ccb-p-t-15">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="sectionField.collapsible"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Collapsible Section', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<div class="col-12 ccb-p-t-15">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="sectionField.defaultCollapsed"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Collapse by Default', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<div class="col-12 ccb-p-t-15">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="sectionField.showName"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Show Name', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
			</div>
		</div>
		<div class="container" v-show="tab === 'styles' && typeof sectionField.styles !== 'undefined'">
			<?php if ( defined( 'CCB_PRO' ) ) : ?>
			<div class="row ccb-p-t-15" v-if="sectionField.styles">
				<div class="col-12">
					<div class="section-styles-apply-to-all-wrapper">
						<div class="list-header section-styles-apply-to-all col-12">
							<div class="ccb-switch">
								<input type="checkbox" v-model="sectionField.styles.applyToAll"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Apply this section style to all sections in this calculator', 'cost-calculator-builder' ); ?></h6>
						</div>
						<div class="row section-styles-color-wrapper">
							<div class="col-6">
								<div class="ccb-input-wrapper color-picker-wrapper" ref="colorpickerText">
									<span class="ccb-input-label"><?php esc_html_e( 'Text color', 'cost-calculator-builder' ); ?></span>
									<div class="ccb-color-box">
										<div class="ccb-color-picker" @click="showPickerText">
											<div class="color" @click="togglePickerText" :style="{backgroundColor: sectionField.styles.text_color || sectionTextColor}"></div>
											<span class="color-value">{{ sectionField.styles.text_color || sectionTextColor }}</span>
											<div class="sticky-popover" v-if="displayPickerText">
												<div class="sticky-cover" @click="togglePickerText"></div>
												<sketch-picker :value="textPickerColors" @input="updateFromPickerText"></sketch-picker>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="col-6" v-if="sectionField.styles.style === 'solid'">
								<div class="ccb-input-wrapper color-picker-wrapper" ref="colorpickerBg">
									<span class="ccb-input-label"><?php esc_html_e( 'Background color', 'cost-calculator-builder' ); ?></span>
									<div class="ccb-color-box">
										<div class="ccb-color-picker" @click="showPickerBg">
											<div class="color" @click="togglePickerBg" :style="{backgroundColor: sectionField.styles.background_color || sectionBackgroundColor}"></div>
											<span class="color-value">{{ sectionField.styles.background_color || sectionBackgroundColor }}</span>
											<div class="sticky-popover" v-if="displayPickerBg">
												<div class="sticky-cover" @click="togglePickerBg"></div>
												<sketch-picker :value="bgPickerColors" @input="updateFromPickerBg"></sketch-picker>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15" v-if="sectionField.styles">
				<div class="col-12">
					<div class="ccb-style-cards">
						<div
							class="ccb-style-card"
							v-for="opt in getSectionStyles"
							:key="opt.value"
							@click="sectionField.styles.style = opt.value"
							:class="{active: sectionField.styles.style === opt.value}"
						>
							<div class="ccb-style-card-preview">
								<img class="ccb-style-card-img" :src="opt.img"/>
							</div>
							<div class="ccb-style-card-radio-wrapper">
								<input :id="'ccb-style-card-radio-' + opt.value" type="radio" :value="opt.value" v-model="sectionField.styles.style"/>
								<span class="ccb-style-card-title">{{ opt.label }}</span>
							</div>
						</div>
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
								<a href="https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=section_styles&licenses=1&billing_cycle=annual" target="_blank">
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
		</div>
	</div>
</div>
