import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocalFile = async () => {
      try {
        // ضع رابط الملف هنا (سواء كان محلي أو مرفوع)
        const response = await fetch('/path_to_your_file/Aliexpress.csv'); 
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let { value: chunk, done: readerDone } = await reader.read();
        
        // تحويل النص المعالج إلى أسطر
        let text = decoder.decode(chunk);
        const lines = text.split('\n').slice(1); // تجاهل السطر الأول (العناوين)

        const parsedProducts = lines.slice(0, 100).map(line => {
          const columns = line.split(';');
          if (columns.length < 9) return null;
          
          return {
            id: columns[0],
            name: columns[1],
            url: columns[2],
            category: columns[3],
            currency: columns[4],
            image: columns[6],
            oldPrice: columns[7],
            price: columns[8]
          };
        }).filter(p => p !== null);

        setProducts(parsedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setLoading(false);
      }
    };

    fetchLocalFile();
  }, []);

  if (loading) return <div className="text-center p-10">جاري تحميل المنتجات...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <div key={product.id} className="glass-morphism p-3 rounded-xl shadow-sm border border-pink-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-40 object-cover rounded-lg"
            loading="lazy" 
          />
          <h3 className="text-sm font-bold mt-2 h-10 overflow-hidden text-right">{product.name}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-pink-600 font-bold">{product.price} {product.currency}</span>
            {product.oldPrice && (
              <span className="text-gray-400 text-xs line-through">{product.oldPrice}</span>
            )}
          </div>
          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-center bg-pink-500 text-white text-xs py-2 mt-3 rounded-full hover:bg-pink-600 transition"
          >
            تسوقي الآن
          </a>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
