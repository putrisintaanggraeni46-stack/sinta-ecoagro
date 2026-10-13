import React from 'react';
import { ShoppingCart, Star, AlertCircle, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  isInCart: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetail,
  isInCart,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Benih & Bibit Unggul':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      case 'Pupuk, Nutrisi & Hayati':
        return 'bg-[#D8F3DC] text-[#1B4332] border-[#B7E4C7]';
      case 'Pestisida & Proteksi Tanaman':
        return 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]';
      case 'Alat, Mesin & Perlengkapan Tani':
        return 'bg-[#EFEBE4] text-[#633919] border-[#D7CCC8]';
      case 'Irigasi & Greenhouse':
        return 'bg-[#CCFBF1] text-[#115E59] border-[#99F6E4]';
      case 'Ternak, Wadah & Pasca Panen':
        return 'bg-[#FAEDCD] text-[#78350F] border-[#E9D8A6]';
      default:
        return 'bg-[#F4EFE6] text-[#4A3E31] border-[#E0D4C0]';
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-[#E8DEC8] hover:border-[#2D6A4F] hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container */}
      <div 
        onClick={() => onViewDetail(product)}
        className="relative aspect-4/3 overflow-hidden bg-[#F4EFE6] cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-xs ${getCategoryTheme(product.category)}`}>
            {product.category}
          </span>
        </div>

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#F59E0B] text-[#78350F] shadow-xs">
              Unggulan
            </span>
          </div>
        )}

        {/* Quick View Button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-white/95 backdrop-blur-xs text-[#1B4332] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-white border border-[#E8DEC8]">
            <Eye className="w-3.5 h-3.5 text-[#2D6A4F]" /> Detail Produk
          </span>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-950/65 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-700 text-white text-xs font-black uppercase px-3 py-1 rounded-md shadow-md tracking-wider">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Unit & Rating */}
          <div className="flex items-center justify-between text-xs text-[#78350F]/70 mb-1.5">
            <span className="font-bold text-[#1B4332] bg-[#D8F3DC]/70 border border-[#B7E4C7] px-2 py-0.5 rounded-md text-[10px]">
              {product.unit}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-bold text-gray-800 text-[11px]">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-[10px]">({product.soldCount} terjual)</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetail(product)}
            className="font-bold text-sm sm:text-base text-[#1F2421] line-clamp-2 hover:text-[#2D6A4F] cursor-pointer transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short description */}
          <p className="mt-1.5 text-xs text-[#6B5E51] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Price & Stock Info */}
        <div className="mt-4 pt-3 border-t border-[#F0EAE1]">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[10px] text-[#8B5E3C] font-semibold uppercase tracking-wider">Harga Petani</span>
              <div className="text-base sm:text-lg font-black text-[#1B4332]">
                {formatRupiah(product.price)}
              </div>
            </div>

            {/* Stock indicator */}
            <div className="text-right">
              {isOutOfStock ? (
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-0.5 justify-end">
                  <AlertCircle className="w-3 h-3" /> Habis
                </span>
              ) : isLowStock ? (
                <span className="text-[11px] text-[#B45309] font-bold flex items-center gap-0.5 justify-end">
                  Sisa {product.stock}
                </span>
              ) : (
                <span className="text-[11px] text-[#78350F]/70 font-medium">
                  Stok: <b className="text-[#1B4332]">{product.stock}</b>
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : isInCart
                ? 'bg-[#D8F3DC] text-[#1B4332] hover:bg-[#B7E4C7] border border-[#52B788]'
                : 'bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] text-white shadow-xs hover:shadow-[#2D6A4F]/25 border border-[#52B788]/30'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 text-[#1B4332]" />
                <span>Tambah Lagi</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-[#D8F3DC]" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
