'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, ShoppingCart, Heart, Share2, Truck, 
  Shield, Clock, Package, ChevronLeft, AlertCircle,
  CheckCircle, Clock as ClockIcon, User, ListPlus, Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MedicineCard from '@/components/medicine/MedicineCard';
import MedicineCardSkeleton from '@/components/medicine/MedicineCardSkeleton';
import { medicineApi } from '@/lib/api/medicine';
import { cartApi } from '@/lib/api/cart';
import { orderApi } from '@/lib/api/order';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  // Fetch medicine details
  const { data: medicineData, isLoading, refetch } = useQuery({
    queryKey: ['medicine', medicineId],
    queryFn: () => medicineApi.getMedicineById(medicineId),
    enabled: !!medicineId,
  });

  const medicine = medicineData?.data;

  // Fetch related medicines
  const { data: relatedMedicinesData, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['related-medicines', medicine?.categoryId],
    queryFn: () => medicineApi.getAllMedicines({
      limit: 4,
    }),
    enabled: !!medicine?.categoryId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () =>
      cartApi.addToCart({
        medicineId,
        quantity,
      }),
    onSuccess: (response) => {
      if (response.success) {
        addItem(response.data!);
        toast.success('Added to cart successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: () =>
      orderApi.addReview(medicineId, {
        rating: review.rating,
        comment: review.comment,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['medicine', medicineId] });
      const previousMedicine = queryClient.getQueryData(['medicine', medicineId]);

      if (previousMedicine && user) {
        const updatedMedicine = {
          ...previousMedicine,
          data: {
            ...previousMedicine.data,
            reviews: [
              {
                id: `temp-${Date.now()}`,
                rating: review.rating,
                comment: review.comment,
                customer: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
                createdAt: new Date().toISOString(),
              },
              ...(previousMedicine.data.reviews || []),
            ],
            reviewCount: (previousMedicine.data.reviewCount || 0) + 1,
            averageRating: calculateNewAverage(
              previousMedicine.data.averageRating || 0,
              previousMedicine.data.reviewCount || 0,
              review.rating
            ),
          },
        };
        queryClient.setQueryData(['medicine', medicineId], updatedMedicine);
      }
      return { previousMedicine };
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setReview({ rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: ['medicine', medicineId] });
      refetch();
    },
    onError: (error, variables, context) => {
      if (context?.previousMedicine) {
        queryClient.setQueryData(['medicine', medicineId], context.previousMedicine);
      }
      toast.error(error.message || 'Failed to submit review');
    },
  });

  const calculateNewAverage = (currentAverage: number, currentCount: number, newRating: number) => {
    const totalSum = currentAverage * currentCount + newRating;
    const newCount = currentCount + 1;
    return totalSum / newCount;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      toast.error('Please login as a customer to add items to cart');
      router.push('/login');
      return;
    }
    if (medicine && medicine.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/checkout');
    }, 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: medicine?.name,
        text: `Check out ${medicine?.name} on MediStore`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading medicine details..." />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Medicine Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The medicine you're looking for doesn't exist.</p>
          <Link href="/shop">
            <Button variant="primary">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Assuming multiple images if provided in future features. Using placeholder copies for gallery effect.
  const images = [medicine.imageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', medicine.imageUrl, medicine.imageUrl].filter(Boolean);
  
  const features = [
    { icon: Shield, label: 'Authentic Product', description: 'Verified from manufacturer' },
    { icon: Truck, label: 'Fast Delivery', description: '2-4 hours in metro cities' },
    { icon: ListPlus, label: 'Quality Assured', description: 'Rigorous quality checks' },
    { icon: Package, label: 'Secure Packaging', description: 'Tamper-proof delivery' },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Home</Link>
            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
            <Link href="/shop" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Shop</Link>
            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
            <Link href={`/shop?category=${medicine.category?.id}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              {medicine.category?.name}
            </Link>
            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate">{medicine.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                {images[selectedImage] ? (
                  <Image
                    src={images[selectedImage]}
                    alt={medicine.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-20 w-20 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Thumbnails Gallery */}
              <div className="flex space-x-3 mt-6 justify-center">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="w-full h-full bg-white dark:bg-gray-800 flex items-center justify-center p-2">
                      {img ? (
                        <Image
                          src={img}
                          alt={`${medicine.name} ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-contain h-full"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{feature.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Header section */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{medicine.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(medicine.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                        {(medicine.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                      <span className="text-gray-500 dark:text-gray-400 hover:text-primary-600 cursor-pointer">
                        {medicine.reviewCount || 0} reviews
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold border border-primary-100 dark:border-primary-800">
                      {medicine.category?.name}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-full transition-all border ${
                      isWishlisted
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800/50'
                        : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white dark:bg-gray-800 text-gray-400 hover:text-primary-600 border border-gray-200 dark:border-gray-700 rounded-full transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center"><Activity className="h-4 w-4 mr-1.5" /> Manufacturer: <strong className="ml-1 text-gray-900 dark:text-gray-200">{medicine.manufacturer}</strong></span>
                <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1.5" /> Expiry: <strong className="ml-1 text-gray-900 dark:text-gray-200">{new Date(medicine.expiryDate).toLocaleDateString()}</strong></span>
              </div>
            </div>

            {/* Price & Stock Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
               {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-transparent rounded-full opacity-50 blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <p className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {formatPrice(medicine.price)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Inclusive of all taxes</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                  medicine.stock > 20
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400'
                    : medicine.stock > 0
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800/50 dark:text-yellow-400'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400'
                } border`}>
                  {medicine.stock > 20
                    ? 'In Stock'
                    : medicine.stock > 0
                    ? `Only ${medicine.stock} left`
                    : 'Out of Stock'}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8 relative z-10">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Quantity
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-gray-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      disabled={quantity >= medicine.stock}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Max: <span className="font-semibold text-gray-900 dark:text-gray-200">{medicine.stock}</span> units available
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <Button
                  variant="primary"
                  size="lg"
                  loading={addToCartMutation.isPending && !isWishlisted}
                  onClick={handleAddToCart}
                  disabled={medicine.stock === 0}
                  className="flex-1 py-4 text-lg font-semibold rounded-xl"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={medicine.stock === 0}
                  className="flex-1 py-4 text-lg font-semibold rounded-xl bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 border-transparent"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Structured Specifications & Overview Tab */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
               <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product Overview</h2>
               </div>
               <div className="p-6">
                 <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line mb-8 text-sm">
                   {medicine.description}
                 </div>
                 
                 <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4">Key Specifications</h3>
                 <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Manufacturer</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{medicine.manufacturer}</p>
                    </div>
                    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Expiry Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{new Date(medicine.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Category</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{medicine.category?.name}</p>
                    </div>
                    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Seller</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{medicine.seller?.name || 'Verified Partner'}</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                Customer Reviews 
                <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{medicine.reviews?.length || 0} reviews</span>
              </h2>

              {/* Add Review Form */}
              {isAuthenticated && user?.role === 'CUSTOMER' && (
                <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Write a Review</h3>
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReview({ ...review, rating: star })}
                        className="p-1 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    placeholder="Share your experience with this medicine..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4 transition-all"
                    rows={3}
                  />
                  <Button
                    onClick={() => addReviewMutation.mutate()}
                    loading={addReviewMutation.isPending}
                    disabled={!review.comment.trim()}
                    className="w-full md:w-auto"
                  >
                    Submit Review
                  </Button>
                </div>
              )}

              {/* Reviews List */}
              {(medicine.reviews && medicine.reviews.length > 0) ? (
                <div className="space-y-6">
                  {medicine.reviews.map((rev: any) => (
                    <div key={rev.id} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                             {rev.customer?.name?.charAt(0) || <User className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {rev.customer?.name || 'Anonymous User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rev.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <Star className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real Related Medicines */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Frequently Bought Together</h2>
            <Link href={`/shop?category=${medicine.category?.id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline font-medium flex items-center">
              View All <ChevronLeft className="h-4 w-4 rotate-180 ml-1" />
            </Link>
          </div>
          
          {isLoadingRelated ? (
             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1, 2, 3, 4].map((i) => (
               <MedicineCardSkeleton key={i} />
             ))}
           </div>
          ) : relatedMedicinesData?.data?.medicines && relatedMedicinesData.data.medicines.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedMedicinesData.data.medicines
                .filter((items: any) => items.id !== medicineId)
                .slice(0, 4)
                .map((relatedMedicine: any) => (
                <MedicineCard key={relatedMedicine.id} medicine={relatedMedicine} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
              <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No related medicines found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}