'use client';

import type { IProductItem } from '@/types/product';

import { get } from 'lodash';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useProducts } from '@/states/products';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid2 from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { _appFeatured, _ecommerceNewProducts, PRODUCT_STOCK_OPTIONS, _ecommerceLatestProducts } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import HeroCarousel from './components/hero-carousel';
import { AppFeatured } from './components/app-featured';
import { EcommerceNewProducts } from './components/ecommerce-new-product';
import { EcommerceLatestProducts } from './components/ecommerce-latest-products';
import { RenderCellPrice, RenderCellStock } from './components/product-table-row';

const sparklineData = [
    { value: 600 },
    { value: 620 },
    { value: 580 },
    { value: 650 },
    { value: 610 },
    { value: 678 },
];
// ----------------------------------------------------------------------

const PRICE_RANGE = [0, 1000];
const CATEGORIES = ['Shoes', 'Accessories', 'Apparel'];

export default function EcommerceHomeView() {
    const router = useRouter();
    // const { products, productsLoading } = useGetProducts();
    const { products, loading: productsLoading } = useProducts();

    const [category, setCategory] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<number[]>(PRICE_RANGE);
    const [stockFilter, setStockFilter] = useState<string>('all');

    const publishedProducts = useMemo(
        () => get(products, 'data', []) as IProductItem[],
        [products]
    );

    const filteredProducts = useMemo(() => {
        let filtered = publishedProducts;

        if (category !== 'all') {
            filtered = filtered.filter((p) => p.category === category);
        }

        filtered = filtered.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        if (stockFilter !== 'all') {
            filtered = filtered.filter((p) => p.inventoryType === stockFilter);
        }

        return filtered;
    }, [publishedProducts, category, priceRange, stockFilter]);

    // Sản phẩm nổi bật (giá cao nhất)
    const featuredProducts = [...filteredProducts]
        .sort((a, b) => b.price - a.price)
        .slice(0, 3);

    // Sản phẩm mới (theo createdAt)
    const newArrivals = [...filteredProducts]
        .slice(0, 6);

    const handleViewProduct = (id: string) => {
        router.push(paths.dashboard.product.details(id));
    };

    return (
        <Container sx={{ py: { xs: 4, md: 2 } }} maxWidth={"xxl" as any}>
            <Stack spacing={6}>
                <Grid2 container spacing={3} sx={{
                    display: 'flex',      // cho container thành flex
                    alignItems: 'stretch', // kéo tất cả item bằng nhau
                }}
                >
                    <Grid2 xs={12} md={8}>
                        <HeroCarousel />
                    </Grid2>

                    {/* Cột phải: EcommerceNewProducts + Card mới */}
                    <Grid2 xs={12} md={4}>
                        <Stack spacing={3} sx={{ height: 665 }}>
                            <AppFeatured list={_appFeatured} />

                            <EcommerceNewProducts list={_ecommerceNewProducts} />

                        </Stack>
                    </Grid2>
                </Grid2>

                {/* Filters & Product Grid */}
                <Container maxWidth="xl">
                    <Grid container spacing={4}>
                        {/* Sidebar Filters */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ position: 'sticky', top: 80 }}>
                                <Card sx={{ p: 3, mb: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Filters
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />

                                    {/* Category */}
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel>Category</InputLabel>
                                        <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                                            <MenuItem value="all">All Categories</MenuItem>
                                            {CATEGORIES.map((cat) => (
                                                <MenuItem key={cat} value={cat}>
                                                    {cat}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Price Range */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography gutterBottom>Price Range</Typography>
                                        <Slider
                                            value={priceRange}
                                            onChange={(_, newValue) => setPriceRange(newValue as number[])}
                                            valueLabelDisplay="auto"
                                            min={0}
                                            max={1000}
                                            step={10}
                                        />
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="caption">${priceRange[0]}</Typography>
                                            <Typography variant="caption">${priceRange[1]}</Typography>
                                        </Stack>
                                    </Box>

                                    {/* Stock Status */}
                                    <FormControl fullWidth>
                                        <InputLabel>Stock</InputLabel>
                                        <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} label="Stock">
                                            <MenuItem value="all">All</MenuItem>
                                            {PRODUCT_STOCK_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        sx={{ mt: 3 }}
                                        onClick={() => {
                                            setCategory('all');
                                            setPriceRange(PRICE_RANGE);
                                            setStockFilter('all');
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </Card>

                                <Card sx={{ p: 0 }}>
                                    <EcommerceLatestProducts title="Latest products" list={_ecommerceLatestProducts} />
                                </Card>

                            </Box>

                        </Grid>

                        {/* Product Grid */}
                        <Grid item xs={12} md={9}>
                            <Stack spacing={4}>
                                {/* Featured Products */}
                                {featuredProducts.length > 0 && (
                                    <>
                                        <Typography variant="h5" fontWeight={700}>
                                            Featured Products
                                        </Typography>
                                        <Grid container spacing={3}>
                                            {featuredProducts.map((product) => (
                                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                                    <ProductCard product={product} onView={handleViewProduct} isFeatured />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </>
                                )}

                                <Divider />

                                {/* All Products */}
                                <Typography variant="h5" fontWeight={700}>
                                    All Products ({filteredProducts.length})
                                </Typography>

                                {productsLoading ? (
                                    <EmptyContent title="Loading products..." />
                                ) : filteredProducts.length === 0 ? (
                                    <EmptyContent title="No products found" />
                                ) : (
                                    <Grid container spacing={3}>
                                        {filteredProducts.map((product) => (
                                            <Grid item xs={12} sm={6} md={4} key={product.id}>
                                                <ProductCard product={product} onView={handleViewProduct} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>

                {/* New Arrivals */}
                <Container maxWidth="xl" >
                    {newArrivals.length > 0 && (
                        <>
                            <Divider />
                            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
                                New Arrivals
                            </Typography>
                            <Grid container spacing={3}>
                                {newArrivals.map((product) => (
                                    <Grid item xs={12} sm={6} md={3} key={product.id}>
                                        <ProductCard product={product} onView={handleViewProduct} compact />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Container>
            </Stack >
        </Container >
    );
}

// ----------------------------------------------------------------------

interface ProductCardProps {
    product: any;
    onView: (id: string) => void;
    isFeatured?: boolean;
    compact?: boolean;
}

function ProductCard({ product, onView, isFeatured = false, compact = false }: ProductCardProps) {
    const isOutOfStock = product.inventoryType === 'out of stock';
    const isLowStock = product.inventoryType === 'low stock';

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                },
                opacity: isOutOfStock ? 0.6 : 1,
                position: 'relative',
            }}
        >
            {isFeatured && (
                <Chip
                    label="Featured"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
                />
            )}

            <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    image={product.coverUrl}
                    alt={product.name}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
                {isOutOfStock && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="h6" color="common.white" fontWeight={700}>
                            Out of Stock
                        </Typography>
                    </Box>
                )}
            </Box>

            <CardContent sx={{ flexGrow: 1, pb: compact ? 2 : 3 }}>
                <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                        {product.category}
                    </Typography>

                    <Typography
                        variant={compact ? 'subtitle2' : 'h6'}
                        fontWeight={600}
                        noWrap={!compact}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                        onClick={() => onView(product.id)}
                    >
                        {product.name}
                    </Typography>

                    {!compact && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Added on {format(new Date(product.createdAt), 'dd MMM yyyy')}
                        </Typography>
                    )}

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <RenderCellPrice params={{ row: product } as any} />
                        <RenderCellStock params={{ row: product } as any} />
                    </Stack>

                    {isLowStock && !compact && (
                        <Chip label="Low Stock" color="warning" size="small" />
                    )}
                </Stack>
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size={compact ? 'small' : 'medium'}
                    startIcon={<Iconify icon="mingcute:shopping-bag-2-line" />}
                    disabled={isOutOfStock}
                    onClick={() => onView(product.id)}
                >
                    {isOutOfStock ? 'View Details' : 'Add to Cart'}
                </Button>
            </Box>
        </Card>
    );
}