const fs = require('fs');

const price_map = {
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
};

const files = ['lamp.html', 'watch.html', 'fan.html', 'accessories.html', 'index.html', 'product.html', 'order.html', 'sales.html', 'assets/js/main.js'];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace $ with ৳ globally
    content = content.replace(/\$/g, '৳');
    
    // Replace specific old prices in HTML text (e.g. ৳129 -> 12,900 ৳)
    for (const [old, newVal] of Object.entries(price_map)) {
        const regex1 = new RegExp(`৳${old}(?!\\d)`, 'g');
        content = content.replace(regex1, `${parseInt(newVal).toLocaleString()} ৳`);
        
        const regex2 = new RegExp(`price=${old}(?!\\d)`, 'g');
        content = content.replace(regex2, `price=${newVal}`);
        
        const regex3 = new RegExp(`, ${old}, `, 'g');
        content = content.replace(regex3, `, ${newVal}, `);
    }
    
    fs.writeFileSync(f, content, 'utf8');
});

console.log("Currency and prices updated successfully.");
