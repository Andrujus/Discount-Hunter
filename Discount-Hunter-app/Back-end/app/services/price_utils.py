"""Utilities for price validation, sanitization, and outlier detection."""

from typing import List, Optional
import statistics


def is_valid_price(price: Optional[float]) -> bool:
    """Check if a price value is valid (positive number)."""
    return price is not None and isinstance(price, (int, float)) and price > 0


def remove_outliers_iqr(values: List[float], multiplier: float = 1.5) -> List[float]:
    """Remove outliers using the IQR method.
    
    Args:
        values: List of numeric values
        multiplier: IQR multiplier (1.5 = standard outlier, 3.0 = extreme outlier)
    
    Returns:
        List of values without outliers
    """
    if len(values) < 4:
        return values
    
    sorted_values = sorted(values)
    q1_idx = len(sorted_values) // 4
    q3_idx = 3 * len(sorted_values) // 4
    
    q1 = sorted_values[q1_idx]
    q3 = sorted_values[q3_idx]
    iqr = q3 - q1
    
    if iqr == 0:
        return values
    
    lower_bound = q1 - multiplier * iqr
    upper_bound = q3 + multiplier * iqr
    
    return [v for v in values if lower_bound <= v <= upper_bound]


def sanitize_prices(price_list: List[dict]) -> List[dict]:
    """Sanitize price data by removing invalid entries and outliers.
    
    Args:
        price_list: List of price dictionaries from scraping results
    
    Returns:
        Cleaned list with valid prices and outliers removed
    """
    # Filter to only valid prices
    valid_items = [item for item in price_list if is_valid_price(item.get('price'))]
    
    if len(valid_items) < 2:
        return valid_items
    
    # Extract prices for outlier detection
    prices = [item['price'] for item in valid_items]
    
    # Remove outliers
    cleaned_prices = remove_outliers_iqr(prices, multiplier=2.0)
    
    # Filter original items to only include non-outlier prices
    price_set = set(cleaned_prices)
    return [item for item in valid_items if item['price'] in price_set]


def get_best_price(price_list: List[dict]) -> Optional[dict]:
    """Get the best (lowest valid) price from a list of price results.
    
    Args:
        price_list: List of price dictionaries
    
    Returns:
        Item with the best price, or None if no valid prices
    """
    sanitized = sanitize_prices(price_list)
    
    if not sanitized:
        return None
    
    return min(sanitized, key=lambda x: x['price'])


def add_price_statistics(price_list: List[dict]) -> dict:
    """Add statistical information about prices.
    
    Args:
        price_list: List of price dictionaries
    
    Returns:
        Dictionary with min, max, mean, median prices
    """
    valid_prices = [item['price'] for item in price_list if is_valid_price(item.get('price'))]
    
    if not valid_prices:
        return {
            'min': None,
            'max': None,
            'mean': None,
            'median': None,
            'count': 0
        }
    
    return {
        'min': min(valid_prices),
        'max': max(valid_prices),
        'mean': round(statistics.mean(valid_prices), 2),
        'median': round(statistics.median(valid_prices), 2),
        'count': len(valid_prices)
    }
