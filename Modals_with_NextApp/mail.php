<?php

$api_key = "aa8e22562da739afd3b81283a413a2d5-us10";
$api_endpoint = 'https://<dc>.api.mailchimp.com/2.0';
$method = "/lists/subscribe";
$verify_ssl = false;
$first_name = $_POST["first_name"];
$last_name = $_POST["last_name"];

$args = array(
                'id'                => 'b1234346',
                'email'             => array('email'=>'davy@example.com'),
                'merge_vars'        => array('FNAME'=>'Davy', 'LNAME'=>'Jones'),
                'double_optin'      => false,
                'update_existing'   => true,
                'replace_interests' => false,
                'send_welcome'      => false,
            );

/**
 * Create a new instance
 */
	$this->api_key = $api_key;
	list(, $datacentre) = explode('-', $this->api_key);
	$this->api_endpoint = str_replace('<dc>', $datacentre, $this->api_endpoint);

/**
 * Call an API method. Every request needs the API key, so that is added automatically -- you don't need to pass it in.
 * @param  string $method The API method to call, e.g. 'lists/list'
 * @param  array  $args   An array of arguments to pass to the method. Will be json-encoded for you.
 * @return array          Associative array of json decoded API response.
 */
function call($method, $args=array(), $timeout = 10)
{
	return $this->makeRequest($method, $args, $timeout);
}

/**
 * Performs the underlying HTTP request. Not very exciting
 * @param  string $method The API method to be called
 * @param  array  $args   Assoc array of parameters to be passed
 * @return array          Assoc array of decoded result
 */
function makeRequest($method, $args=array(), $timeout = 10)
{      
  $args['apikey'] = $this->api_key;
  $url = $this->api_endpoint.'/'.$method.'.json';
  $json_data = json_encode($args);
  if (function_exists('curl_init') && function_exists('curl_setopt')){
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
      curl_setopt($ch, CURLOPT_USERAGENT, 'PHP-MCAPI/2.0');       
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $this->verify_ssl);
      curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);
      $result = curl_exec($ch);
      curl_close($ch);
  } else {
      $result    = file_get_contents($url, null, stream_context_create(array(
          'http' => array(
              'protocol_version' => 1.1,
              'user_agent'       => 'PHP-MCAPI/2.0',
              'method'           => 'POST',
              'header'           => "Content-type: application/json\r\n".
                                    "Connection: close\r\n" .
                                    "Content-length: " . strlen($json_data) . "\r\n",
              'content'          => $json_data,
          ),
      )));
  }
  return $result ? json_decode($result, true) : false;
}

// Make API call
$result = call($method, $args);
error_log(json_encode($result), 0);

?>