import os
import re

price_map = {
    '129': '12900',
    '249': '24900',
    '149': '14900',
    '399': '39900',
    '449': '44900',
    '299': '29900',
    '199': '19900',
    '99': '9900',
    '49': '4900',
    '59': '5900',
    '39': '3900'
}

files = ['lamp.html', 'watch.html', 'fan.html', 'accessories.html', 'index.html', 'product.html', 'order.html', 'sales.html', 'assets/js/main.js']

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace $ with ৳
    content = content.replace('$', '৳')
    
    # Replace specific old prices in HTML text (e.g. ৳129 -> 12,900 ৳)
    for old, new in price_map.items():
        # Look for ৳ followed by the old price
        content = re.sub(rf'৳{old}(?!\d)', f'{int(new):,} ৳', content)
        # Look for price={old} in URLs
        content = re.sub(rf'price={old}(?!\d)', f'price={new}', content)
        # Look for cart.add(..., {old}, ...)
        content = re.sub(rf', {old}, ', f', {new}, ', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Currency and prices updated successfully.")
