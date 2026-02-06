<?php
$modal_types = array(
	'preview'       => array(
		'type' => 'preview',
		'path' => CALC_PATH . '/templates/admin/single-calc/modals/modal-preview.php',
	),
	'calc-settings' => array(
		'type' => 'calc-settings',
		'path' => CALC_PATH . '/templates/admin/single-calc/modals/calc-settings.php',
	),
	'quick-tour'    => array(
		'type' => 'quick-tour',
		'path' => CALC_PATH . '/templates/admin/single-calc/modals/quick-tour-start.php',
	),
	'history'       => array(
		'type' => 'history',
		'path' => CALC_PATH . '/templates/admin/single-calc/modals/history.php',
	),
);

$pro_active = defined( 'CCB_PRO' ) ? 'active' : '';

?>
<div class="ccb-create-calc" :class="{'active': toggleMenu}">
	<div class="ccb-create-calc-content">
		<div class="ccb-not-allowed ccb-create-calc-content-fields">
			<div class="ccb-fields-container ccb-hint-fields-container" :class="{'ccb-container-empty': $store.getters.getBuilder?.length === 0}">
				<div class="ccb-fields-header">
					<div class="ccb-fields-header-box">
						<div class="ccb-fields-header-box-calculator-title">
							<span class="ccb-calc-title calc-quick-tour-title-box" v-if="!getEditVal">
								<span class="ccb-title" @click="getEditVal = true">{{ title }}</span>
								<i class="ccb-title-edit ccb-icon-Path-3483" @click="getEditVal = true"></i>
							</span>
							<span class="ccb-calc-title calc-quick-tour-title-box" v-else>
								<input type="text" class="ccb-title" v-model="title" @blur="editTitle">
								<i class="ccb-title-approve ccb-icon-Path-3484" @click="() => edit_title(false)"></i>
							</span>
						</div>
						<span class="ccb-default-description ccb-light"><?php esc_html_e( 'Drag and drop elements from sidebar here to create a calculator', 'cost-calculator-builder' ); ?></span>
					</div>
					<?php if ( defined( 'CALC_DEV_MODE' ) ) : ?>
						<button class="ccb-button success ccb-settings" @click="openTemplateSettings"><?php esc_html_e( 'Config', 'cost-calculator-builder' ); ?></button>
					<?php endif; ?>
				</div>

				<div class="ccb-fields-builder">
					<div class="ccb-fields-builder__header">
						<div class="ccb-fields-builder__pages">
							<draggable v-model="builderPages" style="display: flex;">
								<div class="ccb-fields-builder__page" v-for="page in builderPages" @click="setActivePage(page.alias)" :key="page.id" :class="{'ccb-fields-builder__page-active': activePageId === page.alias, 'ccb-fields-builder__page-error': checkErrorsPages().includes(page.alias)}">
									<div class="ccb-fields-builder__page-icon">
										<i class="ccb-icon-drag-dots"></i>
									</div>
									<div class="ccb-fields-builder__page-title">{{ page.label }}</div>
									<div class="ccb-fields-builder__page-edit" @click.stop="e => editField(e, 'page-break', page.alias, null, { pageId: page.alias })" v-if="enoughPages">
										<i class="ccb-icon-Path-3483"></i>
									</div>
									<div class="ccb-fields-builder__page-delete" @click.stop="deletePage(page)" v-if="enoughPages">
										<i class="ccb-icon-Path-3503"></i>
									</div>
								</div>
							</draggable>
						</div>
						<div class="ccb-fields-builder__add-page" @click="addPage" :class="{'ccb-fields-builder__add-page-lock': !proActive}">
							<i class="ccb-icon-Path-3493"></i>
							<span class="ccb-item-lock-inner" v-if="!proActive"><i class="ccb-icon-Path-3482"></i> <span>Pro</span></span>
						</div>
						<div class="ccb-fields-builder__page-settings" @click.stop="e => editField(e, 'page-navigation', null, null, { pageId: activePageId })" v-if="enoughPages">
							<i class="ccb-icon-Union-28"></i>
						</div>
					</div>
				</div>
				<div class="ccb-fields-wrapper ccb-custom-scrollbar " :class="{'ccb-disable-scroll': $store.getters.getBuilder.length === 0}">
					<component
						v-model="builderFields"
						group="fields"
						@show-confirm="showConfirm"
						@edit-field="editFieldEvent"
						:active-page-id="activePageId"
						:is="layout"
						@add-section="addSection"
						:active-page="builderPages.filter(page => page.alias === activePageId)[0]"
						@edit-total-summary="editTotalSummary"
						:edit-field-tab="editFieldTab"
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="ccb-phantom-sidebar"></div>
	<div class="ccb-create-calc-sidebar ccb-custom-scrollbar calc-quick-tour-elements" :class="{'active': toggleMenu}" :style="getCalcSidebarStyleForElementStyleTourStep['ccb-create-calc-sidebar']" >
		<div class="ccb-sidebar-toggle" @click="toggleMenu = !toggleMenu" :class="{'active': !toggleMenu}">
			<i class="ccb-icon-Path-3398"></i>
		</div>
		<div class="ccb-create-calc-sidebar-header" :class="sidebarTab">
			<div class="ccb-create-calc-sidebar-header__item" @click="sidebarTab = 'elements'" :class="{'ccb-create-calc-sidebar-header__item-active': sidebarTab === 'elements'}">
				<?php esc_html_e( 'Elements', 'cost-calculator-builder' ); ?>
			</div>
			<div class="ccb-create-calc-sidebar-header__item" @click="sidebarTab = 'layouts'" :class="{'ccb-create-calc-sidebar-header__item-active': sidebarTab === 'layouts'}">
				<?php esc_html_e( 'Layouts', 'cost-calculator-builder' ); ?>
			</div>
		</div>
		<div class="ccb-sidebar-tabs" v-if="sidebarTab === 'elements'">
			<div class="ccb-sidebar__fields-tabs" :class="{'right-tab': fieldsTab === 'calcFields'}">
				<div class="ccb-sidebar__fields-tab" @click="fieldsTab = 'elements'">
					<?php esc_html_e( 'Elements', 'cost-calculator-builder' ); ?>
				</div>
				<div class="ccb-sidebar__fields-tab" @click="fieldsTab = 'calcFields'">
					<?php esc_html_e( 'Your Elements', 'cost-calculator-builder' ); ?>
				</div>
			</div>
			<div class="ccb-sidebar__fields" v-if="fieldsTab === 'elements'" :key="'elements'">
				<?php echo \cBuilder\Classes\CCBTemplate::load( '/admin/single-calc/partials/sidebar-items' ); // phpcs:ignore ?>
			</div>
			<div class="ccb-sidebar-builder-fields" v-if="fieldsTab === 'calcFields'" :key="'calcFields'">
				<div class="ccb-sidebar-builder-fields__elements" v-if="editFieldTab === 'builderFields'">
					<div class="ccb-sidebar-builder-fields__tab-icon-search">
						<i class="ccb-icon-Search-Magnifier"></i>
						<input type="text" v-model="fieldsSearch" placeholder="Search">
					</div>
					<div v-for="(field, index) in calculatorFields" class="ccb-sidebar-builder-fields__element" :key="field.id" @click="editField(event, field.type, field.alias, field.index, { pageId: field.pageId, section: field.sectionId, group: field.groupId })">
						<div class="ccb-sidebar-builder-fields__element-icon">
							<i :class="field.icon"></i>
						</div>
						<div class="ccb-sidebar-builder-fields__element-description">
							<div class="ccb-sidebar-builder-fields__element-description-title">
								{{ field.label }}
							</div>
							<div class="ccb-sidebar-builder-fields__element-description-id">
								[{{ field.alias }}]
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="ccb-sidebar-tabs" v-if="sidebarTab === 'layouts'">
			<div class="ccb-sidebar-layouts-container">
				<div class="ccb-sidebar-layout" v-for="layoutItem in layouts" :key="layout.id" @click="setBuilderLayout(layoutItem.id)" :class="{'ccb-sidebar-layout-active': layoutItem.id === layout}">
					<div class="ccb-sidebar-layout__img" :style="{ backgroundImage: `url(${layoutItem.img})` }"></div>
					<div class="ccb-sidebar-layout__title">{{ layoutItem.title }}</div>
				</div>
			</div>
		</div>
	</div>
	<div class="ccb-sidebar__fields-tab-edit-field ccb-custom-scrollbar " v-if="editFieldTab === 'editField'" :class="{'has-content': getType}">
		<?php
		$fields = \cBuilder\Helpers\CCBFieldsHelper::fields();
		?>
		<?php foreach ( $fields as $key => $field ) : ?>
			<component
					inline-template
					:key="updateEditKey"
					:field="fieldData"
					@save="addOrSaveField"
					:id="editId"
					:index="getIndex"
					:order="getOrderId"
					@cancel="closeOrCancelField"
					:available="$store.getters.getBuilder"
					is="<?php echo esc_attr( $field['type'] ); ?>-field"
					v-if="editId.type === '<?php echo esc_attr( $field['type'] ); ?>'"
			>
				<?php echo \cBuilder\Classes\CCBTemplate::load( '/admin/single-calc/fields/' . $field['type'] . '-field' ); // phpcs:ignore ?>
			</component>
		<?php endforeach; ?>
	</div>
	<div class="ccb-sidebar__fields-tab-edit-field ccb-total-summary-edit" v-if="editFieldTab === 'totalSummary'">
		<total-summary-edit inline-template @cancel="closeTotalSummaryEdit">
			<?php echo \cBuilder\Classes\CCBTemplate::load( '/admin/single-calc/fields/total-summary' ); // phpcs:ignore ?>
		</total-summary-edit>
	</div>
	<ccb-confirm-popup
		v-if="confirmPopup"
		:status="confirmPopup"
		@close-confirm="removeFromBuilder"
		:page-count="pageCount"
		:delete-field-settings="deleteFieldSettings"
		cancel="<?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?>"
		del="<?php esc_html_e( 'Delete field', 'cost-calculator-builder' ); ?>"
	>
		<slot>
			<span slot="description"><?php esc_html_e( 'Are you sure you want to delete this field and all data associated with it?', 'cost-calculator-builder' ); ?></span>
			<span slot="pageDescription"><?php esc_html_e( 'Are you sure you want to delete this page and all data associated with it? Fields on this page will be moved to the next/previous page.', 'cost-calculator-builder' ); ?></span>
		</slot>
	</ccb-confirm-popup>
	<ccb-confirm-condition-popup
		v-if="confirmInConditionPopup"
		:status="confirmInConditionPopup"
		@close-condition-confirm-popup="confirmInCondition"
		ok="<?php esc_html_e( 'Ok', 'cost-calculator-builder' ); ?>"
		cancel="<?php esc_html_e( 'Cancel', 'cost-calculator-builder' ); ?>"
	>
		<slot>
			<span slot="description"><?php esc_html_e( 'Are you sure you want to move a field with Conditions? Moving it will delete all its Conditions.', 'cost-calculator-builder' ); ?></span>
		</slot>
	</ccb-confirm-condition-popup>
	<ccb-modal-window>
		<template v-slot:content>
			<?php foreach ( $modal_types as $m_type ) : ?>
				<template v-if="$store.getters.getModalType === '<?php echo esc_attr( $m_type['type'] ); ?>'">
					<?php require_once $m_type['path']; ?>
				</template>
			<?php endforeach; ?>
		</template>
	</ccb-modal-window>
</div>
