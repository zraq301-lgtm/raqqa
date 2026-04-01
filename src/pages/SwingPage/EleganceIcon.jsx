import React, { useState, useEffect } from 'react';
import { Search, Heart, ExternalLink } from 'lucide-react';

const ModestFashionGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('hijab fashion');

  // جلب البيانات من Unsplash
  const fetchFashionData = async (query) => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_UNSPLASH_KEY;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=12&orientation=portrait`,
        {
          headers: {
            Authorization: `Client-ID ${apiKey}`,
          },
        }
      );
      const data = await response.json();
      setPhotos(data.results);
    } catch (error) {
      console.error("Error fetching data from Unsplash:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFashionData(category);
  }, [category]);

  return (
    <div className="min-h-screen bg-[#fdf6f6] p-4 md:p-8">
      {/* Header - Glassmorphism Design */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#4a4a4a] mb-4">مملكة الأناقة والموضة</h1>
        <div className="flex flex-wrap justify-center gap-3">
          {['hijab fashion', 'modest outfits', 'hijab style', 'abaya design'].map((tag) => (
            <button
              key={tag}
              onClick={() => setCategory(tag)}
              className={`px-6 py-2 rounded-full transition-all duration-300 border border-white/30 backdrop-blur-md
                ${category === tag ? 'bg-[#ffb7c5] text-white' : 'bg-white/50 text-[#7a7a7a] hover:bg-[#ffe4e9]'}`}
            >
              {tag === 'hijab fashion' ? 'أناقة المحجبات' : tag === 'modest outfits' ? 'ملابس محتشمة' : tag === 'hijab style' ? 'تنسيق الحجاب' : 'عبايات مودرن'}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffb7c5]"></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="group relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500"
            >
              {/* Image Container */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={photo.urls.regular}
                  alt={photo.alt_description}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <img 
                      src={photo.user.profile_image.small} 
                      className="w-8 h-8 rounded-full border border-white" 
                      alt={photo.user.name} 
                    />
                    <span className="text-sm font-medium">{photo.user.name}</span>
                  </div>
                  <div className="flex gap-3">
                    <Heart className="w-5 h-5 cursor-pointer hover:text-red-400 fill-current text-white/80" />
                    <a href={photo.links.html} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-5 h-5 text-white/80" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModestFashionGallery;
