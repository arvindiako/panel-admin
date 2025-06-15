$(document).ready(function() {
    let isFilterVisible = false;
    let activeDropdown = null;
    
    // Initialize
    initializeFilter();
    
    function initializeFilter() {
        setupEventListeners();
        setupDropdowns();
        setupInputValidation();
        setupKeyboardNavigation();
        setupTouchSupport();
        initializeTooltips();
    }
    
    function setupEventListeners() {
        // Toggle filter box
        $('.filter_btn_openning').on('click', function(e) {
            e.preventDefault();
            toggleFilter();
        });
        
        // Close filter box
        $('#closeFilter').on('click', function(e) {
            e.preventDefault();
            hideFilter();
        });
        
        // Backdrop click
        $('.filter-backdrop').on('click', function() {
            hideFilter();
        });
        
        // Apply filter
        $('#applyFilter').on('click', function(e) {
            e.preventDefault();
            applyFilter();
        });
        
        // Reset filter
        $('#resetFilter').on('click', function(e) {
            e.preventDefault();
            resetFilter();
        });
        
        // Radio button changes
        $('input[name="orderType"]').on('change', function() {
            handleRadioChange($(this));
        });
        
        // Prevent filter content clicks from closing
        $('.filter-content-wrapper').on('click', function(e) {
            e.stopPropagation();
        });
    }
    
    function setupDropdowns() {
        $('.custom-dropdown').each(function() {
            const $dropdown = $(this);
            const $trigger = $dropdown.find('.dropdown-trigger');
            const $menu = $dropdown.find('.dropdown-menu');
            const $options = $dropdown.find('.dropdown-option');
            const $search = $dropdown.find('.search-input');
            
            // Trigger click
            $trigger.on('click', function(e) {
                e.preventDefault();
                toggleDropdown($dropdown);
            });
            
            // Option selection
            $options.on('click', function(e) {
                e.preventDefault();
                selectOption($dropdown, $(this));
            });
            
            // Search functionality
            $search.on('input', function() {
                filterOptions($dropdown, $(this).val());
            });
            
            // Keyboard navigation for dropdown
            $trigger.on('keydown', function(e) {
                handleDropdownKeydown(e, $dropdown);
            });
        });
    }
    
    function setupInputValidation() {
        $('.custom-input[type="number"]').each(function() {
            const $input = $(this);
            
            $input.on('input', function() {
                validateNumberInput($(this));
            });
            
            $input.on('blur', function() {
                formatNumberInput($(this));
            });
            
            $input.on('focus', function() {
                $(this).closest('.custom-input-wrapper').addClass('focused');
            });
            
            $input.on('blur', function() {
                $(this).closest('.custom-input-wrapper').removeClass('focused');
            });
        });
    }
    
    function setupKeyboardNavigation() {
        $(document).on('keydown', function(e) {
            if (!isFilterVisible) return;
            
            switch(e.key) {
                case 'Escape':
                    e.preventDefault();
                    if (activeDropdown) {
                        closeDropdown(activeDropdown);
                    } else {
                        hideFilter();
                    }
                    break;
                case 'Enter':
                    if (!activeDropdown && e.target.tagName !== 'INPUT') {
                        e.preventDefault();
                        applyFilter();
                    }
                    break;
                case 'Tab':
                    handleTabNavigation(e);
                    break;
            }
        });
    }
    
    function setupTouchSupport() {
        // Add touch support for mobile devices
        $('.custom-radio label, .dropdown-trigger, .btn-apply, .btn-reset').on('touchstart', function() {
            $(this).addClass('touch-active');
        }).on('touchend touchcancel', function() {
            $(this).removeClass('touch-active');
        });
    }
    
    function toggleFilter() {
        if (isFilterVisible) {
            hideFilter();
        } else {
            showFilter();
        }
    }
    
    function showFilter() {
        const $filterBox = $('#filterBox');
        const $toggleBtn = $('#filterToggle');
        
        $filterBox.removeClass('hide').addClass('show').show();
        $toggleBtn.addClass('active').find('.btn-text').text('Close Filter');
        $toggleBtn.find('i').removeClass('fa-filter').addClass('fa-times');
        
        isFilterVisible = true;
        
        // Focus first focusable element
        setTimeout(() => {
            $filterBox.find('input[type="radio"]:checked').first().focus();
        }, 300);
        
        // Prevent body scroll
        $('body').addClass('filter-open');
    }
    
    function hideFilter() {
        const $filterBox = $('#filterBox');
        const $toggleBtn = $('#filterToggle');
        
        $filterBox.removeClass('show').addClass('hide');
        $toggleBtn.removeClass('active').find('.btn-text').text('Open Filter');
        $toggleBtn.find('i').removeClass('fa-times').addClass('fa-filter');
        
        // Close any open dropdowns
        if (activeDropdown) {
            closeDropdown(activeDropdown);
        }
        
        setTimeout(() => {
            $filterBox.hide();
            isFilterVisible = false;
        }, 300);
        
        // Restore body scroll
        $('body').removeClass('filter-open');
    }
    
    function toggleDropdown($dropdown) {
        if (activeDropdown && activeDropdown[0] !== $dropdown[0]) {
            closeDropdown(activeDropdown);
        }
        
        const $trigger = $dropdown.find('.dropdown-trigger');
        const $menu = $dropdown.find('.dropdown-menu');
        
        if ($trigger.hasClass('active')) {
            closeDropdown($dropdown);
        } else {
            openDropdown($dropdown);
        }
    }
    
    function openDropdown($dropdown) {
        const $trigger = $dropdown.find('.dropdown-trigger');
        const $menu = $dropdown.find('.dropdown-menu');
        const $search = $dropdown.find('.search-input');
        
        $trigger.addClass('active');
        $menu.removeClass('hide').addClass('show').show();
        activeDropdown = $dropdown;
        
        // Focus search input
        setTimeout(() => {
            $search.focus();
        }, 100);
        
        // Position dropdown if needed
        positionDropdown($dropdown);
    }
    
    function closeDropdown($dropdown) {
        const $trigger = $dropdown.find('.dropdown-trigger');
        const $menu = $dropdown.find('.dropdown-menu');
        
        $trigger.removeClass('active');
        $menu.removeClass('show').addClass('hide');
        
        setTimeout(() => {
            $menu.hide();
        }, 200);
        
        activeDropdown = null;
    }
    
    function selectOption($dropdown, $option) {
        const value = $option.data('value');
        const text = $option.find('.option-text').text();
        const icon = $option.find('.option-icon, .customer-avatar').clone();
        
        // Update trigger
        const $trigger = $dropdown.find('.dropdown-trigger');
        const $valueIcon = $trigger.find('.value-icon');
        const $valueText = $trigger.find('.value-text');
        
        if (icon.length) {
            $valueIcon.replaceWith(icon.addClass('value-icon'));
        }
        $valueText.text(text);
        
        // Update active state
        $dropdown.find('.dropdown-option').removeClass('active');
        $option.addClass('active');
        
        // Store value
        $dropdown.data('value', value);
        
        // Close dropdown
        closeDropdown($dropdown);
        
        // Add selection animation
        $trigger.addClass('selected');
        setTimeout(() => {
            $trigger.removeClass('selected');
        }, 300);
    }
    
    function filterOptions($dropdown, searchTerm) {
        const $options = $dropdown.find('.dropdown-option');
        const term = searchTerm.toLowerCase();
        
        $options.each(function() {
            const $option = $(this);
            const text = $option.find('.option-text').text().toLowerCase();
            
            if (text.includes(term)) {
                $option.show();
            } else {
                $option.hide();
            }
        });
    }
    
    function positionDropdown($dropdown) {
        const $menu = $dropdown.find('.dropdown-menu');
        const dropdownRect = $dropdown[0].getBoundingClientRect();
        const menuHeight = $menu.outerHeight();
        const windowHeight = $(window).height();
        const spaceBelow = windowHeight - dropdownRect.bottom;
        
        if (spaceBelow < menuHeight && dropdownRect.top > menuHeight) {
            $menu.css({
                top: 'auto',
                bottom: '100%',
                marginBottom: '8px',
                marginTop: '0'
            });
        } else {
            $menu.css({
                top: '100%',
                bottom: 'auto',
                marginTop: '8px',
                marginBottom: '0'
            });
        }
    }
    
    function handleRadioChange($radio) {
        const $label = $radio.next('label');
        
        // Add ripple effect
        addRippleEffect($label, event);
        
        // Add selection animation
        $label.addClass('selected');
        setTimeout(() => {
            $label.removeClass('selected');
        }, 300);
    }
    
    function validateNumberInput($input) {
        let value = parseFloat($input.val());
        
        if (isNaN(value) || value < 0) {
            $input.val('');
            return;
        }
        
        // Limit decimal places during input
        const stringValue = $input.val();
        const decimalIndex = stringValue.indexOf('.');
        if (decimalIndex !== -1 && stringValue.length - decimalIndex > 3) {
            $input.val(stringValue.substring(0, decimalIndex + 3));
        }
    }
    
    function formatNumberInput($input) {
        const value = parseFloat($input.val());
        if (!isNaN(value)) {
            $input.val(value.toFixed(2));
        }
    }
    
    function handleDropdownKeydown(e, $dropdown) {
        const $trigger = $dropdown.find('.dropdown-trigger');
        const $menu = $dropdown.find('.dropdown-menu');
        const $options = $dropdown.find('.dropdown-option:visible');
        
        switch(e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                toggleDropdown($dropdown);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if ($trigger.hasClass('active')) {
                    $options.first().focus();
                } else {
                    openDropdown($dropdown);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if ($trigger.hasClass('active')) {
                    $options.last().focus();
                } else {
                    openDropdown($dropdown);
                }
                break;
        }
    }
    
    function handleTabNavigation(e) {
        // Custom tab navigation logic for better UX
        const focusableElements = $('#filterBox').find('input, button, [tabindex="0"]').filter(':visible');
        const currentIndex = focusableElements.index($(e.target));
        
        if (e.shiftKey) {
            // Shift + Tab (backward)
            if (currentIndex === 0) {
                e.preventDefault();
                focusableElements.last().focus();
            }
        } else {
            // Tab (forward)
            if (currentIndex === focusableElements.length - 1) {
                e.preventDefault();
                focusableElements.first().focus();
            }
        }
    }
    
    function applyFilter() {
        const $btn = $('#applyFilter');
        const originalContent = $btn.html();
        
        // Show loading state
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i><span class="btn-text">در حال اعمال...</span>');
        
        // Collect filter data
        const filterData = getFilterData();
        
        // Add ripple effect
        addRippleEffect($btn, event);
        
        // Simulate API call
        setTimeout(() => {
            console.log('Filter Data:', filterData);
             const $filterBox = $('#filterBox');
            
            // Show success state
            $btn.html('<i class="fas fa-check"></i><span class="btn-text">اعمال شد!</span>');
            
            setTimeout(() => {
                $btn.prop('disabled', false).html(originalContent);
                
                // Optionally close filter after applying
                // hideFilter();
            }, 1500);
                    setTimeout(() => {
                $filterBox.hide();
            }, 2000);
            
            // Here you would typically make your actual API call
            // processFilters(filterData);
            
        }, 1000);
    }
    
    function resetFilter() {
        const $btn = $('#resetFilter');
        const originalContent = $btn.html();
        
        // Add ripple effect
        addRippleEffect($btn, event);
        
        // Reset all form elements with staggered animation
        const $sections = $('.filter-section');
        
        $sections.each(function(index) {
            const $section = $(this);
            
            setTimeout(() => {
                $section.css('opacity', '0.5');
                
                // Reset radio buttons
                $section.find('input[type="radio"]').prop('checked', false);
                $section.find('input[name="orderType"]:first').prop('checked', true);
                
                // Reset dropdowns
                $section.find('.custom-dropdown').each(function() {
                    const $dropdown = $(this);
                    const $firstOption = $dropdown.find('.dropdown-option:first');
                    if ($firstOption.length) {
                        selectOption($dropdown, $firstOption);
                    }
                });
                
                // Reset inputs
                $section.find('.custom-input').val('');
                
                setTimeout(() => {
                    $section.css('opacity', '1');
                }, 200);
                
            }, index * 100);
        });
        
        // Show feedback
        $btn.html('<i class="fas fa-check"></i><span class="btn-text">Reset!</span>');
        setTimeout(() => {
            $btn.html(originalContent);
        }, 1500);
    }
    
    function getFilterData() {
        return {
            orderType: $('input[name="orderType"]:checked').val(),
            status: $('.custom-dropdown[data-dropdown="status"]').data('value') || 'all',
            customer: $('.custom-dropdown[data-dropdown="customer"]').data('value') || 'all',
            amountFrom: $('[data-input="amount-from"]').val() || null,
            amountTo: $('[data-input="amount-to"]').val() || null,
            timestamp: new Date().toISOString()
        };
    }
    
    function addRippleEffect($element, event) {
        const $ripple = $element.find('.btn-ripple, .radio-ripple, .dropdown-ripple');
        if (!$ripple.length) return;
        
        const rect = $element[0].getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (event?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
        const y = (event?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
        
        $ripple.css({
            width: size + 'px',
            height: size + 'px',
            left: x + 'px',
            top: y + 'px'
        }).removeClass('ripple-animate');
        
        // Trigger reflow
        $ripple[0].offsetHeight;
        
        $ripple.addClass('ripple-animate');
        
        setTimeout(() => {
            $ripple.removeClass('ripple-animate');
        }, 600);
    }
    
    function processFilters(filterData) {
        // This is where you would implement your actual filtering logic
        // Example AJAX call:
        /*
        $.ajax({
            url: '/api/filters/apply',
            method: 'POST',
            data: JSON.stringify(filterData),
            contentType: 'application/json',
            success: function(response) {
                console.log('Filters applied successfully:', response);
                // Update UI with filtered results
                updateFilteredResults(response.data);
            },
            error: function(xhr, status, error) {
                console.error('Error applying filters:', error);
                showErrorMessage('Failed to apply filters. Please try again.');
            }
        });
        */
    }
    
    function updateFilteredResults(data) {
        // Update your results display here
        console.log('Updating results with:', data);
    }
    
    function showErrorMessage(message) {
        // Show error notification
        console.error(message);
    }
    
    // Handle window resize
    $(window).on('resize', function() {
        if (activeDropdown) {
            positionDropdown(activeDropdown);
        }
    });
    
    // Handle orientation change on mobile
    $(window).on('orientationchange', function() {
        setTimeout(() => {
            if (activeDropdown) {
                positionDropdown(activeDropdown);
            }
        }, 100);
    });
    
    // Close dropdowns when clicking outside
    $(document).on('click', function(e) {
        if (activeDropdown && !$(e.target).closest('.custom-dropdown').length) {
            closeDropdown(activeDropdown);
        }
    });
    
    // Add CSS class for touch devices
    if ('ontouchstart' in window) {
        $('body').addClass('touch-device');
    }
    
    // Performance optimization: debounce search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Apply debounce to search inputs
    $('.search-input').on('input', debounce(function() {
        const $dropdown = $(this).closest('.custom-dropdown');
        filterOptions($dropdown, $(this).val());
    }, 300));
    
    // Initialize tooltips for better UX (optional)
    function initializeTooltips() {
        $('[data-tooltip]').each(function() {
            const $element = $(this);
            const tooltip = $element.data('tooltip');
            
            $element.on('mouseenter', function() {
                showTooltip($element, tooltip);
            }).on('mouseleave', function() {
                hideTooltip();
            });
        });
    }
    
    function showTooltip($element, tooltip) {
        // Implement tooltip show logic here
        console.log('Showing tooltip:', tooltip);
    }
    
    function hideTooltip() {
        // Implement tooltip hide logic here
        console.log('Hiding tooltip');
    }
    
    // Add smooth scrolling for better mobile experience
    if (window.innerWidth <= 768) {
        $('#filterToggle').on('click', function() {
            if (isFilterVisible) {
                setTimeout(() => {
                    $('html, body').animate({
                        scrollTop: 0
                    }, 300);
                }, 100);
            }
        });
    }
    
    // Export functions for external use
    window.FilterBox = {
        show: showFilter,
        hide: hideFilter,
        toggle: toggleFilter,
        getData: getFilterData,
        reset: resetFilter,
        apply: applyFilter
    };
});

// Additional CSS for ripple animation
const additionalCSS = `
.ripple-animate {
    animation: ripple 0.6s linear;
}

.touch-device .custom-radio label:hover,
.touch-device .dropdown-trigger:hover,
.touch-device .btn-apply:hover,
.touch-device .btn-reset:hover {
    transform: none;
}

.touch-active {
    transform: scale(0.98) !important;
}

.filter-open {
    overflow: hidden;
}

.selected {
    animation: pulse 0.3s ease-in-out;
}

@media (max-width: 575.98px) {
    .filter-container {
        padding: 0;
    }
    
    .filter-content-wrapper {
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        max-height: 90vh;
    }
    
    .filter-content-wrapper.show {
        animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .filter-content-wrapper.hide {
        animation: slideOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

@keyframes slideInUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes slideOutDown {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(100%);
    }
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);