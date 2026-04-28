$price_map = @{
    '129' = '12900'
    '249' = '24900'
    '149' = '14900'
    '399' = '39900'
    '449' = '44900'
    '299' = '29900'
    '199' = '19900'
    '99'  = '9900'
    '49'  = '4900'
    '59'  = '5900'
    '39'  = '3900'
}

$files = @('lamp.html', 'watch.html', 'fan.html', 'accessories.html', 'index.html', 'product.html', 'order.html', 'sales.html', 'assets/js/main.js')

foreach ($f in $files) {
    $content = Get-Content -Raw $f -Encoding UTF8
    
    # Replace $ with ৳
    $content = $content -replace '\$', '৳'
    
    foreach ($old in $price_map.Keys) {
        $new = $price_map[$old]
        # Replace ৳129 with 12,900 ৳
        $formatted = "{0:N0} ৳" -f [int]$new
        $content = [regex]::Replace($content, "৳$old(?!\d)", $formatted)
        
        # Replace price=129 with price=12900
        $content = [regex]::Replace($content, "price=$old(?!\d)", "price=$new")
        
        # Replace , 129, with , 12900,
        $content = [regex]::Replace($content, ", $old, ", ", $new, ")
    }
    
    Set-Content $f -Value $content -Encoding UTF8
}
