<?php
// Silence is golden
$page_param   = isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'calculator'; // phpcs:ignore WordPress.Security.NonceVerification
$action_param = isset( $_GET['action'] ) ? sanitize_text_field( $_GET['action'] ) : null; // phpcs:ignore WordPress.Security.NonceVerification
$id_param     = isset( $_GET['id'] ) ? sanitize_text_field( $_GET['id'] ) : null; // phpcs:ignore WordPress.Security.NonceVerification

?>

<div id="calculator_admin" data-page="<?php echo esc_attr( $page_param ); ?>" data-action-mode="<?php echo esc_attr( $action_param ); ?>" data-calc-id="<?php echo esc_attr( $id_param ); ?>"></div>
