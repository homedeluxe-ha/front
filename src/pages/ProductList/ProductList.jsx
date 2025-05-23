import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import fetchApi from "../../api/fetchApi";
import { addToCart } from "../../redux/shoppingCartSlice";
import ProductCartQty from "../../components/commons/ProductCartQty/ProductCartQty";
import CustomSelect from "../../components/commons/CustomSelect/CustomSelect";
import BlackButton from "../../components/commons/BlackButton/BlackButton";
import Loading from "../../components/Loading/Loading";
import ChevronIcon from "../../components/commons/Chevron/ChevronIcon";

import "./ProductList.css";
import { Button, Form, Offcanvas } from "react-bootstrap";

function ProductList() {
  const [products, setProducts] = useState([]);
  const shoppingCart = useSelector((state) => state.shoppingCart);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showPrice, setShowPrice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("Recent");
  const [filters, setFilters] = useState({
    categoryId: null,
    orderBy: "createdAt",
    order: "desc",
  });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentCategoryName, setCurrentCategoryName] = useState("Products");

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  useEffect(() => {
    getProducts();
  }, [filters, slug]);

  const getCategories = async () => {
    try {
      const data = await fetchApi({ method: "get", url: "/categories" });
      setCategories(data.categories);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const getProducts = async () => {
    try {
      setLoading(true);
      const { categoryId, orderBy, order, minPrice, maxPrice } = filters;

      let queryParams = [];
      if (categoryId) queryParams.push(`categoryId=${categoryId}`);
      if (orderBy) queryParams.push(`orderBy=${orderBy}`);
      if (order) queryParams.push(`order=${order}`);
      if (minPrice !== null && minPrice !== undefined) queryParams.push(`minPrice=${minPrice}`);
      if (maxPrice !== null && maxPrice !== undefined) queryParams.push(`maxPrice=${maxPrice}`);

      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";

      const data = await fetchApi({ method: "get", url: `/products${queryString}` });
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (slug && categories.length) {
      const category = categories.find((cat) => cat.slug === slug);
      if (category) {
        setFilters((prev) => ({
          ...prev,
          categoryId: category.id,
        }));
        setCurrentCategoryName(category.name);
      } else {
        setFilters((prev) => ({
          ...prev,
          categoryId: null,
        }));
        setCurrentCategoryName("Products");
      }
    } else {
      setCurrentCategoryName("Products");
    }
  }, [slug, categories]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const isProductIncart = (productId) => {
    return shoppingCart.some((item) => item.id === productId);
  };

  const handleCategoryFilter = (slug) => {
    if (slug === null) {
      setFilters((prev) => ({
        ...prev,
        categoryId: null,
      }));
      navigate(`/products?orderBy=${filters.orderBy}&order=${filters.order}`);
      return;
    }

    const selectedCategory = categories.find((cat) => cat.slug === slug);
    if (selectedCategory) {
      setFilters((prev) => ({
        ...prev,
        categoryId: selectedCategory.id,
      }));
      navigate(`/products/categories/${slug}?orderBy=${filters.orderBy}&order=${filters.order}`);
    }
  };

  const handleOrderSelect = (orderValue) => {
    const orderBy =
      orderValue === "Lower Price" || orderValue === "Higher Price" ? "price" : "createdAt";
    setFilters((prev) => ({
      ...prev,
      orderBy,
      order: orderValue === "Lower Price" ? "asc" : "desc",
    }));
    setSelectedOrder(orderValue);
    navigate(
      slug
        ? `/products/categories/${slug}?orderBy=${filters.orderBy}&order=${filters.order}`
        : `/products?orderBy=${filters.orderBy}&order=${filters.order}`,
    );
  };

  const handlePriceFilter = () => {
    const newFilters = {
      ...filters,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : null,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : null,
    };
    setFilters(newFilters);

    navigate(
      slug
        ? `/products/categories/${slug}?orderBy=${newFilters.orderBy}&order=${newFilters.order}`
        : `/products?orderBy=${newFilters.orderBy}&order=${newFilters.order}`,
    );
  };

  const resetFilters = () => {
    setFilters({
      categoryId: null,
      orderBy: "createdAt",
      order: "desc",
      minPrice: null,
      maxPrice: null,
    });
    setPriceRange({ min: "", max: "" });
    navigate(`/products`);
  };

  return (
    <div className="productList-container overflow-hidden">
      <div className="container header-container d-md-flex justify-content-between align-items-center mt-4">
        <div className="text-center div-text-category">
          {products.length > 0 && (
            <h5 className="fw-bold main-text text-uppercase">{currentCategoryName}</h5>
          )}
        </div>
        <div className="div-search-products">
          <div className="filter-wrapper d-flex">
            <span className="text-secondary items">{products.length} items</span>

            <span className="filter-btn btn-standard" onClick={handleShow}>
              <i className="bi bi-funnel-fill"></i> <span className="filter-text">Filter</span>
            </span>

            <Offcanvas
              show={showOffcanvas}
              onHide={handleClose}
              placement="start"
              className="offcanvas"
            >
              <div className="offcanvas-body">
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Filter Products</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <div className="filter-options">
                    <div className="categories-item">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        onClick={() => setShowCategories(!showCategories)}
                      >
                        <p className="filter-heading mb-0">Categories</p>
                        <ChevronIcon isOpen={showCategories} />
                      </div>
                      {showCategories && (
                        <div className="pt-2 filter-by-category">
                          <ul className="list-unstyled d-flex flex-column gap-1">
                            <li onClick={() => handleCategoryFilter(null)}>All Products</li>
                            {categories
                              .filter(
                                (category) =>
                                  category.productCount > 0 && category.name !== "Uncategorized",
                              )
                              .map((category) => (
                                <li
                                  key={category.id}
                                  onClick={() => handleCategoryFilter(category.slug)}
                                >
                                  {category.name}{" "}
                                  <small className="text-secondary">
                                    ({category.productCount})
                                  </small>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <hr />

                    <div className="price mb-3">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        onClick={() => setShowPrice(!showPrice)}
                      >
                        <p className="filter-heading mb-0">Price (USD)</p>
                        <ChevronIcon isOpen={showPrice} />
                      </div>

                      {showPrice && (
                        <Form className="filter-by-price-wrapper pt-3 ps-0 pe-0">
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="number"
                              min={1}
                              placeholder="Min Price"
                              value={priceRange.min}
                              onChange={(e) =>
                                setPriceRange({ ...priceRange, min: e.target.value })
                              }
                            />
                            <span className="align-self-center">-</span>
                            <Form.Control
                              type="number"
                              min={1}
                              placeholder="Max Price"
                              value={priceRange.max}
                              onChange={(e) =>
                                setPriceRange({ ...priceRange, max: e.target.value })
                              }
                            />
                          </div>
                          <BlackButton
                            type="button"
                            className="btn-price-filter mt-3"
                            onClick={handlePriceFilter}
                          >
                            OK
                          </BlackButton>
                        </Form>
                      )}
                    </div>

                    <hr />
                    <Button
                      className="btn-reset-filters btn01s btn-standard border-0 mt-3"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>

                  <Button className="btn01 btn-standard border-0" onClick={handleClose}>
                    View Products
                  </Button>
                </Offcanvas.Body>
              </div>
            </Offcanvas>
          </div>
          <CustomSelect selectedValue={selectedOrder} onSelect={handleOrderSelect} />
        </div>
      </div>
      <hr />

      <div className="container content-container">
        {loading ? (
          <Loading />
        ) : products.length > 0 ? (
          <div className="d-flex flex-wrap my-4 justify-content-center text-center all-cards">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.slug}`}>
                <div className="p-0 mx-4 my-4 card-container mb-4">
                  <div className="card position-relative">
                    <div className="position-absolute rounded-circle d-flex justify-content-center align-items-center flex-column  price-container">
                      <small>{product.currency}</small>
                      <span>
                        {Number(product.price).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {product?.image?.length > 0 && (
                      <img
                        src={
                          product.image[0].includes("http")
                            ? product.image[0]
                            : `${import.meta.env.VITE_IMAGE_DB_URL}/${product.image[0]}`
                        }
                        className="card-img-top"
                        alt={product.name}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="accesories-text fw-bold">
                      {product.category?.name || product.category}
                    </p>
                    <h2 className="fw-bold main-text-card">{product.name}</h2>
                    <div className="div-border my-4"></div>
                    <div className="text-description mb-4">
                      <p>{product.description}</p>
                    </div>
                    {!isProductIncart(product.id) ? (
                      <button
                        className="card-text-btn rounded-pill"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                      >
                        <span>{product.stock !== 0 ? "Add to cart" : "Out of stock"}</span>
                      </button>
                    ) : (
                      <div
                        className="btn-update-cart rounded-pill btn-outline"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <ProductCartQty
                          product={shoppingCart.find((item) => item.id === product.id)}
                          inCard
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <h3 className="fw-bold text-secondary">No products available</h3>
            <p className="text-secondary">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
