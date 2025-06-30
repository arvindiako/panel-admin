
    // Custom Dropdown System
    class OrderCustomDropdown {
        constructor(element) {
            this.dropdown = $(element);
            this.trigger = this.dropdown.find('.order-dropdown-trigger');
            this.menu = this.dropdown.find('.order-dropdown-menu');
            this.text = this.dropdown.find('.order-dropdown-text');
            this.items = this.dropdown.find('.order-dropdown-item');
            this.isOpen = false;
            this.selectedValue = '';
            this.selectedText = this.text.text();
            
            this.init();
        }

        init() {
            // Toggle dropdown
            this.trigger.on('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            // Select item
            this.items.on('click', (e) => {
                const item = $(e.currentTarget);
                const value = item.data('value');
                const text = item.text().trim();
                
                this.select(value, text);
                this.close();
            });

            // Close on outside click
            $(document).on('click', (e) => {
                if (!this.dropdown[0].contains(e.target)) {
                    this.close();
                }
            });
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            if (this.dropdown.hasClass('order-disabled')) return;
            
            // Close other dropdowns
            $('.order-custom-dropdown.order-active').each((i, el) => {
                if (el !== this.dropdown[0]) {
                    $(el).removeClass('order-active').find('.order-dropdown-menu').removeClass('order-show');
                }
            });

            this.dropdown.addClass('order-active');
            this.menu.addClass('order-show');
            this.isOpen = true;
        }

        close() {
            this.dropdown.removeClass('order-active');
            this.menu.removeClass('order-show');
            this.isOpen = false;
        }

        select(value, text) {
            this.selectedValue = value;
            this.selectedText = text;
            this.text.text(text);
            
            // Update active state
            this.items.removeClass('order-active');
            this.items.filter(`[data-value="${value}"]`).addClass('order-active');
            
            // Trigger change event
            this.dropdown.trigger('change', [value, text]);
        }

        getValue() {
            return this.selectedValue;
        }

        setText(text) {
            this.text.text(text);
            this.selectedText = text;
        }

        disable() {
            this.dropdown.addClass('order-disabled');
            this.close();
        }

        enable() {
            this.dropdown.removeClass('order-disabled');
        }

        reset() {
            const firstItem = this.items.first();
            const value = firstItem.data('value');
            const text = firstItem.text().trim();
            this.select(value, text);
        }
    }

    // Form validation
    class OrderFormValidator {
        constructor() {
            this.rules = {};
        }

        addRule(fieldId, validator, message) {
            this.rules[fieldId] = { validator, message };
        }

        validate(fieldId, value) {
            const rule = this.rules[fieldId];
            if (!rule) return { valid: true };

            const isValid = rule.validator(value);
            return {
                valid: isValid,
                message: isValid ? '' : rule.message
            };
        }

        validateAll(formData) {
            const errors = [];
            
            Object.keys(this.rules).forEach(fieldId => {
                const value = formData[fieldId] || '';
                const result = this.validate(fieldId, value);
                
                if (!result.valid) {
                    errors.push({
                        field: fieldId,
                        message: result.message
                    });
                    
                    // Add error styling to dropdown or input
                    const element = $(`[data-dropdown="${fieldId}"]`);
                    if (element.length) {
                        element.find('.order-dropdown-trigger').addClass('order-error');
                        setTimeout(() => {
                            element.find('.order-dropdown-trigger').removeClass('order-error');
                        }, 3000);
                    } else {
                        $(`#${fieldId}`).addClass('order-error');
                        setTimeout(() => {
                            $(`#${fieldId}`).removeClass('order-error');
                        }, 3000);
                    }
                }
            });

            return errors;
        }
    }

    // Initialize systems
    // const notifications = new OrderNotificationSystem();
    const validator = new OrderFormValidator();

    // Initialize all dropdowns
    const dropdowns = {};
    $('.order-custom-dropdown').each(function() {
        const dropdownName = $(this).data('dropdown');
        dropdowns[dropdownName] = new OrderCustomDropdown(this);
    });

    // Add validation rules with Persian messages
    validator.addRule('customerSelect', (value) => {
        const isNewCustomer = $('#newCustomerToggle').is(':checked');
        return isNewCustomer || value !== '';
    }, 'لطفاً یک مشتری انتخاب کنید یا حالت مشتری جدید را فعال کنید');

    validator.addRule('paymentType', (value) => value !== '', 'لطفاً نوع پرداخت را انتخاب کنید');
    validator.addRule('orderType', (value) => value !== '', 'لطفاً نوع سفارش را انتخاب کنید');

    // Bootstrap Modal Events
    const modal = new bootstrap.Modal('#createOrderModal');
    
    $('.create_order_button ').on('click', function() {
        modal.show();

    });

    // Modal event listeners
    $('#createOrderModal').on('shown.bs.modal', function() {
        // Focus first dropdown when modal opens
        dropdowns.customerSelect.trigger.focus();
    });

    $('#createOrderModal').on('hidden.bs.modal', function() {
        resetForm();
    });

    // New customer toggle
    $('#newCustomerToggle').on('change', function() {
        const isChecked = $(this).is(':checked');
        
        if (isChecked) {
            dropdowns.customerSelect.disable();
           showNotification('حالت مشتری جدید فعال شد', 'info');
        } else {
            dropdowns.customerSelect.enable();
            showNotification('حالت مشتری موجود فعال شد', 'info');
        }
    });

    // Dropdown change handlers
    // Object.keys(dropdowns).forEach(key => {
    //     $(`[data-dropdown="${key}"]`).on('change', function(e, value, text) {
    //         console.log(`${key} changed:`, value, text);
            
    //         if (value) {
    //             showNotification(`${text} انتخاب شد`, 'success', { duration: 2000 });
    //         }
    //     });
    // });

    // Product search with debounce
    let searchTimeout;
    $('#productSearch').on('input', function() {
        const searchTerm = $(this).val();
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (searchTerm.length > 2) {
               showNotification(`جستجو برای: ${searchTerm}`, 'info', { duration: 2000 });
                console.log('Searching for products:', searchTerm);
            }
        }, 500);
    });

    // Form submission
    $('#createOrderBtn').on('click', function() {
        const button = $(this);
        button.addClass('order-loading');

        // Collect form data
        const formData = {
            customerSelect: dropdowns.customerSelect.getValue(),
            paymentType: dropdowns.paymentType.getValue(),
            orderType: dropdowns.orderType.getValue(),
            orderStatus: dropdowns.orderStatus.getValue(),
            orderDate: $('#orderDate').val(),
            orderTime: $('#orderTime').val(),
            orderNote: $('#orderNote').val(),
            newCustomer: $('#newCustomerToggle').is(':checked')
        };

        // Validate form
        const errors = validator.validateAll(formData);

        setTimeout(() => {
            button.removeClass('order-loading');

            if (errors.length > 0) {
                errors.forEach(error => {
                   showNotification(error.message, 'error');
                });
                return;
            }

            // Success
           showNotification('سفارش با موفقیت ایجاد شد!', 'success');
            console.log('Order Data:', formData);
            
            // Close modal and reset form
            setTimeout(() => {
                modal.hide();
            }, 1500);
        }, 1000);
    });

    // Reset form function
    function resetForm() {
        dropdowns.customerSelect.reset();
        dropdowns.paymentType.reset();
        dropdowns.orderType.reset();
        dropdowns.orderStatus.select('pending', 'در انتظار');
        $('#orderNote').val('');
        $('#productSearch').val('');
        $('#newCustomerToggle').prop('checked', false);
        dropdowns.customerSelect.enable();
        
        // Remove any error states
        $('.order-error').removeClass('order-error');
    }

    

    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open dropdowns first
            $('.order-custom-dropdown.order-active').each(function() {
                dropdowns[$(this).data('dropdown')].close();
            });
        }
    });

    // Auto-save draft
    let draftTimeout;
    $('input, textarea').on('input change', function() {
        clearTimeout(draftTimeout);
        draftTimeout = setTimeout(() => {
            const formData = {
                customerSelect: dropdowns.customerSelect.getValue(),
                paymentType: dropdowns.paymentType.getValue(),
                orderType: dropdowns.orderType.getValue(),
                orderNote: $('#orderNote').val()
            };
            
            localStorage.setItem('orderDraft', JSON.stringify(formData));
        }, 1000);
    });

    // Load draft on page load
    const savedDraft = localStorage.getItem('orderDraft');
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            
            // Set dropdown values
            Object.keys(draft).forEach(key => {
                if (draft[key] && dropdowns[key]) {
                    const item = $(`[data-dropdown="${key}"] .order-dropdown-item[data-value="${draft[key]}"]`);
                    if (item.length) {
                        dropdowns[key].select(draft[key], item.text().trim());
                    }
                } else if (draft[key] && $(`#${key}`).length) {
                    $(`#${key}`).val(draft[key]);
                }
            });
        } catch (e) {
            console.log('Error loading draft:', e);
        }
    }
