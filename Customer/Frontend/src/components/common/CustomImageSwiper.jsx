import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const CustomImageSwiper = ({ images = [], height = 'h-48' }) => {
  if (!images.length) return null;
  return (
    <div className={`w-full my-4 ${height}`}>
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Navigation, Pagination, Autoplay]}
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={src}
              alt={`Slide ${idx + 1}`}
              className={`w-full ${height} object-cover rounded-lg`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CustomImageSwiper;