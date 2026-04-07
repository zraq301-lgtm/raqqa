import React, { useState } from 'react';

export default function FoodApp() {
  // بيانات الأصناف
  const menu = [
    { id: 1, name: "شاورما دجاج", price: 50 },
    { id: 2, name: "بطاطس مقلية", price: 20 },
    { id: 3, name: "عصير برتقال", price: 15 }
  ];

  // حالة السلة
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // تنسيق سريع (Internal CSS)
  const styles = {
    container: { padding: '20px', fontFamily: 'Arial', textAlign: 'right', direction: 'rtl' },
    card: { border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' },
    button: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer', borderRadius: '4px' },
    cartBox: { marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderTop: '2px solid #333' }
  };

  return (
    <div style={styles.container}>
      <h1>🍴 منيو الأكيل</h1>
      
      <div>
        {menu.map(item => (
          <div key={item.id} style={styles.card}>
            <div>
              <strong>{item.name}</strong> - {item.price} جنيه
            </div>
            <button style={styles.button} onClick={() => addToCart(item)}>
              إضافة +
            </button>
          </div>
        ))}
      </div>

      <div style={styles.cartBox}>
        <h2>🛒 السلة ({cart.length})</h2>
        {cart.length === 0 ? <p>السلة فارغة</p> : 
          <ul>
            {cart.map((i, index) => <li key={index}>{i.name} - {i.price} جنيه</li>)}
          </ul>
        }
        <hr />
        <strong>الإجمالي: {cart.reduce((total, item) => total + item.price, 0)} جنيه</strong>
      </div>
    </div>
  );
}
