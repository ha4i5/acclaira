<?php

// Product Name
$config['product_name'] = 'Mail - Acclaira';

// Override Roundcube IMAP and SMTP to use internal localhost
$config['imap_host'] = 'ssl://127.0.0.1:993';
$config['smtp_host'] = 'tls://127.0.0.1:587';

$config['imap_conn_options'] = array(
    'ssl' => array(
        'verify_peer'       => false,
        'verify_peer_name'  => false
    ),
);
$config['smtp_conn_options'] = array(
    'ssl' => array(
        'verify_peer'      => false,
        'verify_peer_name' => false
    ),
);
