<div class="cbb-edit-field-container">
	<div class="ccb-edit-field-header">
		<div class="ccb-edit-field-header-left">
			<span class="ccb-edit-field-title ccb-heading-3 ccb-bold">{{ getFieldTitle(htmlField) || "HTML element" }}</span>
		</div>
		<div class="ccb-edit-field-header-right">
			<div class="ccb-save-wrapper">
				<button class="ccb-button" @click.prevent="$emit( 'cancel' )"><?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?></button>
				<button class="ccb-button success" @click.prevent="$emit( 'save', htmlField, id, index, htmlField.alias)"><?php esc_html_e( 'Done', 'cost-calculator-builder' ); ?></button>
			</div>
		</div>
	</div>
	<div class="ccb-grid-box">
		<div class="container">
			<div class="row ccb-p-t-15">
					<div class="col-12">
						<div class="ccb-field-name">
							<div class="ccb-field-name__header">
								<div class="ccb-field-name__label"><?php esc_html_e( 'Element name', 'cost-calculator-builder' ); ?></div>
								<div class="ccb-field-name__id">{{ htmlField.alias }}</div>
							</div>
							<div class="ccb-field-name__body">
								<input type="text" placeholder="<?php esc_attr_e( 'Enter field name', 'cost-calculator-builder' ); ?>" v-model.trim="htmlField.label">
							</div>
						</div>
					</div>
				</div>
			<div class="row">
				<div class="col-12">
					<div class="calc-html-textarea ccb-p-t-15">
						<span class="ccb-input-label"><?php esc_html_e( 'HTML5 Code', 'cost-calculator-builder' ); ?></span>
						<textarea rows="14" v-model="htmlField.htmlContent" placeholder="<?php esc_attr_e( 'Put HTML code here', 'cost-calculator-builder' ); ?>"></textarea>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15" v-if="!disableFieldHiddenByDefault(htmlField)">
				<div class="col-6">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="htmlField.hidden"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Hidden by Default', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-builder-radio-wrapper">
						<span class="ccb-radio-label"><?php esc_html_e( 'Element Width (%)', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-radio-box">
							<input class="ccb-builder-radio__radio" :id="'ccb-width-25-' + htmlField.alias" type="radio" :name="'width-' + htmlField.alias" value="25" v-model="htmlField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 25 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-25-' + htmlField.alias"><?php esc_html_e( '25', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-50-' + htmlField.alias" type="radio" :name="'width-' + htmlField.alias" value="50" v-model="htmlField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 50 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-50-' + htmlField.alias"><?php esc_html_e( '50', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-75-' + htmlField.alias" type="radio" :name="'width-' + htmlField.alias" value="75" v-model="htmlField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 75 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-75-' + htmlField.alias"><?php esc_html_e( '75', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-100-' + htmlField.alias" type="radio" :name="'width-' + htmlField.alias" value="100" v-model="htmlField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 100 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-100-' + htmlField.alias"><?php esc_html_e( '100', 'cost-calculator-builder' ); ?></label>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
