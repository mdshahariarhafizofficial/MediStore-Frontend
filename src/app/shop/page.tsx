'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, Filter, SlidersHorizontal, Grid3X3, List, 
  ChevronLeft, ChevronRight, Package, Star, Truck, 
  Shield, Clock, TrendingUp, ShoppingCart
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MedicineCard from '@/components/medicine/MedicineCard';
import MedicineCardSkeleton from '@/components/medicine/MedicineCardSkeleton';
import Button from '@/components/ui/Button';
import { medicineApi } from '@/lib/api/medicine';
import { Category } from '@/lib/types';
import { cartApi } from '@/lib/api/cart';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => medicineApi.getCategories(),
  });

  // Fetch medicines with filters
  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['medicines', search, category, minPrice, maxPrice, sortBy, sortOrder, page],
    queryFn: () =>
      medicineApi.getAllMedicines({
        search,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: page.toString(),
        limit: '12',
      }),
  });

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (page > 1) params.set('page', page.toString());
    
    router.push(`/shop?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    router.push('/shop');
  };

  useEffect(() => {
    handleFilter();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddToCart = async (medicineId: string) => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      toast.error('Please login as a customer to add items to cart');
      router.push('/login');
      return;
    }

    try {
      const response = await cartApi.addToCart({
        medicineId,
        quantity: 1,
      });

      if (response.success) {
        addItem(response.data!);
        toast.success('Added to cart successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Newest', icon: Clock },
    { value: 'price', label: 'Price', icon: TrendingUp },
    { value: 'name', label: 'Name', icon: Package },
  ];

  const features = [
    { icon: Shield, text: '100% Authentic', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
    { icon: Truck, text: 'Fast Delivery', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' },
    { icon: Star, text: 'Top Rated', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576602976047-17f1c6fe9549?w=1600&q=80')] opacity-5 mix-blend-overlay bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Discover Premium Medicines</h1>
            <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
              Find authentic, certified medications effortlessly. Filter categories, sort by relevance, and order with a single click.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                placeholder="Search medicines, brands, or symptoms..."
                className="w-full px-6 py-4 pl-14 rounded-2xl text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-white/40 dark:focus:ring-primary-500/50 shadow-xl transition-shadow border-none placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 transition-colors" />
              <button
                onClick={handleFilter}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-800 dark:bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-900 dark:hover:bg-primary-700 transition-all font-semibold shadow-md active:scale-95"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 hover:-translate-y-1 transition-transform"
            >
              <div className={`p-3 rounded-lg ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{feature.text}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guaranteed standard</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary-500" />
                  Filters
                </h2>
                <button
                  onClick={handleReset}
                  className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 uppercase text-sm tracking-wider">Categories</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setCategory('')}
                    className={`block w-full text-left px-3 py-2.5 rounded-xl transition-all font-medium text-sm border ${
                      category === '' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800/50' 
                        : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categoriesData?.data?.map((cat: Category) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`block w-full text-left px-3 py-2.5 rounded-xl transition-all font-medium text-sm border ${
                        category === cat.id 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800/50' 
                          : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate pr-2">{cat.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${
                           category === cat.id ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {cat._count?.medicines || 0}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 uppercase text-sm tracking-wider">Price Range</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Min (৳)</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Max (৳)</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="1000"
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleFilter}
                    className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 uppercase text-sm tracking-wider">Sort By</h3>
                <div className="space-y-1.5">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center w-full text-left px-3 py-2.5 rounded-xl transition-all font-medium text-sm border ${
                        sortBy === option.value 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800/50' 
                          : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <option.icon className={`h-4 w-4 mr-3 ${sortBy === option.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <span className="ml-auto text-xs opacity-70">
                          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      sortOrder === 'asc' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Lower First
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      sortOrder === 'desc' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Higher First
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Control Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    Products
                    {medicinesData?.data?.pagination?.total && (
                      <span className="text-gray-400 dark:text-gray-500 text-lg font-medium ml-2 border-l border-gray-200 dark:border-gray-700 pl-2">
                        {medicinesData.data.pagination.total} <span className="text-sm font-normal">results</span>
                      </span>
                    )}
                  </h2>
                  {search && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Results for <span className="font-semibold text-gray-900 dark:text-white">"{search}"</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    size="sm"
                    className="lg:hidden flex items-center dark:border-gray-600 dark:text-gray-300"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      aria-label="Grid View"
                    >
                      <Grid3X3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      aria-label="List View"
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Medicines Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(6)].map((_, i) => <MedicineCardSkeleton key={i} />)}
              </div>
            ) : medicinesData?.data?.medicines?.length ? (
              <>
                <div className={`
                  ${viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                  }
                `}>
                  {medicinesData.data.medicines.map((medicine: any) => (
                    viewMode === 'grid' ? (
                      <MedicineCard key={medicine.id} medicine={medicine} />
                    ) : (
                      <div key={medicine.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="sm:w-1/3 md:w-1/4">
                            <div className="relative h-48 sm:h-full min-h-[160px] bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
                              {medicine.imageUrl ? (
                                <img
                                  src={medicine.imageUrl}
                                  alt={medicine.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="sm:w-2/3 md:w-3/4 flex flex-col justify-between">
                            <div>
                               <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">{medicine.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">By {medicine.manufacturer}</p>
                                 </div>
                                 <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                   ৳{medicine.price}
                                 </div>
                               </div>
                               <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{medicine.description}</p>
                               
                               <div className="flex flex-wrap gap-2 mb-4">
                                 <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium border border-primary-100 dark:border-primary-800/50">
                                   {medicine.category?.name}
                                 </span>
                                 <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${medicine.stock > 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800/50' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50'}`}>
                                   Stock: {medicine.stock}
                                 </span>
                               </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border border-yellow-100 dark:border-yellow-800/30">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="ml-1 font-semibold text-yellow-700 dark:text-yellow-500 text-sm">{medicine.averageRating?.toFixed(1) || '0.0'}</span>
                                </div>
                                <span className="text-gray-400 text-sm">
                                  ({medicine.reviewCount || 0} reviews)
                                </span>
                              </div>
                              <div className="flex space-x-2 w-full sm:w-auto">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1 sm:flex-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                  onClick={() => router.push(`/shop/${medicine.id}`)}
                                >
                                  Details
                                </Button>
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => handleAddToCart(medicine.id)}
                                  disabled={medicine.stock === 0}
                                >
                                  <ShoppingCart className="h-4 w-4 sm:mr-2" />
                                  <span className="hidden sm:inline">Add</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Advanced Pagination Navigation */}
                {medicinesData.data.pagination.totalPages > 1 && (
                  <div className="mt-12 mb-8 flex flex-col items-center">
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, medicinesData.data.pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (medicinesData.data.pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= medicinesData.data.pagination.totalPages - 2) {
                          pageNum = medicinesData.data.pagination.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${
                              page === pageNum
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === medicinesData.data.pagination.totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Products Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                  {search
                    ? `We couldn't find anything matching "${search}". Please try adjusting your filters.`
                    : 'No medicines available right now. Please check back later.'}
                </p>
                {(search || category || minPrice || maxPrice) && (
                  <Button onClick={handleReset} variant="primary" className="px-8 shadow-sm">
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}