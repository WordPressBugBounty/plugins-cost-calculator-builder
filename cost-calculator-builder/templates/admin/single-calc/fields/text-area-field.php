<div class="cbb-edit-field-container">
	<div class="ccb-edit-field-header">
		<div class="ccb-edit-field-header-left">
			<span class="ccb-edit-field-title ccb-heading-3 ccb-bold">{{ getFieldTitle(textField) || "Text field" }}</span>
		</div>
		<div class="ccb-edit-field-header-right">
			<div class="ccb-save-wrapper">
				<button class="ccb-button" @click.prevent="$emit( 'cancel' )"><?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?></button>
				<button class="ccb-button success" @click.prevent="$emit( 'save', textField, id, index, textField.alias )"><?php esc_html_e( 'Done', 'cost-calculator-builder' ); ?></button>
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
		<div class="container" v-show="tab === 'main'">
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-field-name">
						<div class="ccb-field-name__header">
							<div class="ccb-field-name__label"><?php esc_html_e( 'Element name', 'cost-calculator-builder' ); ?></div>
							<div class="ccb-field-name__id">{{ textField.alias }}</div>
						</div>
						<div class="ccb-field-name__body">
							<input type="text" placeholder="<?php esc_attr_e( 'Enter field name', 'cost-calculator-builder' ); ?>" v-model.trim="textField.label">
							<input type="text" placeholder="<?php esc_attr_e( 'Enter field placeholder', 'cost-calculator-builder' ); ?>" v-model.trim="textField.placeholder">
							<input type="text" placeholder="<?php esc_attr_e( 'Enter field description', 'cost-calculator-builder' ); ?>" v-model.trim="textField.description">
						</div>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-builder-radio-wrapper">
						<span class="ccb-radio-label"><?php esc_html_e( 'Element Width (%)', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-radio-box">
							<input class="ccb-builder-radio__radio" :id="'ccb-width-25-' + textField.alias" type="radio" :name="'width-' + textField.alias" value="25" v-model="textField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 25 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-25-' + textField.alias"><?php esc_html_e( '25', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-50-' + textField.alias" type="radio" :name="'width-' + textField.alias" value="50" v-model="textField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 50 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-50-' + textField.alias"><?php esc_html_e( '50', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-75-' + textField.alias" type="radio" :name="'width-' + textField.alias" value="75" v-model="textField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 75 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-75-' + textField.alias"><?php esc_html_e( '75', 'cost-calculator-builder' ); ?></label>

							<input class="ccb-builder-radio__radio" :id="'ccb-width-100-' + textField.alias" type="radio" :name="'width-' + textField.alias" value="100" v-model="textField.width" @change="document.dispatchEvent(new CustomEvent('ccb_field_width_change', { detail: { alias: id.alias, width: 100 } }))">
							<label class="ccb-builder-radio__option" :for="'ccb-width-100-' + textField.alias"><?php esc_html_e( '100', 'cost-calculator-builder' ); ?></label>
						</div>
					</div>
				</div>
			</div>
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-input-wrapper">
						<span class="ccb-input-label"><?php esc_html_e( 'Max. Number Of Characters', 'cost-calculator-builder' ); ?></span>
						<div class="ccb-input-box">
							<input type="text" name="numberOfCharacters" min="0" step="1" v-model="textField.numberOfCharacters" placeholder="<?php esc_attr_e( 'Enter number of characters', 'cost-calculator-builder' ); ?>">
							<span @click="numberCounterAction('numberOfCharacters')" class="input-number-counter up"></span>
							<span @click="numberCounterAction('numberOfCharacters', '-')" class="input-number-counter down"></span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="container" v-show="tab === 'settings'">
			<div class="row ccb-p-t-20 switch-row">
				<div class="col-12" v-if="!disableFieldHiddenByDefault(textField)">
					<div class="list-header">
						<div class="ccb-switch">
							<input type="checkbox" v-model="textField.hidden"/>
							<label></label>
						</div>
						<h6><?php esc_html_e( 'Hidden by Default', 'cost-calculator-builder' ); ?></h6>
					</div>
				</div>
				<?php if ( ccb_pro_active() ) : ?>
					<div class="col-12">
						<div class="list-header">
							<div class="ccb-switch">
								<input type="checkbox" v-model="textField.required"/>
								<label></label>
							</div>
							<h6><?php esc_html_e( 'Required', 'cost-calculator-builder' ); ?></h6>
						</div>
					</div>
				<?php endif; ?>
			</div>
			<div class="row ccb-p-t-15">
				<div class="col-12">
					<div class="ccb-input-wrapper">
						<span class="ccb-input-label"><?php esc_html_e( 'Additional Classes', 'cost-calculator-builder' ); ?></span>
						<textarea v-model="textField.additionalStyles" placeholder="<?php esc_attr_e( 'Set Additional Classes', 'cost-calculator-builder' ); ?>"></textarea>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
