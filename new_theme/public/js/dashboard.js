// Dashboard JavaScript with ApexCharts
(function() {
    'use strict';

    let salesChart, customerChart;
    let currentPeriod = '1Y';

    // Initialize date range picker
    function initDateRangePicker() {
        const dateInput = $('#date-range-picker');
        if (dateInput.length) {
            // Set default date range (last 7 days)
            const start = moment().subtract(7, 'days');
            const end = moment();
            
            dateInput.daterangepicker({
                startDate: start,
                endDate: end,
                opens: 'left',
                locale: {
                    format: 'MM/DD/YYYY'
                }
            }, function(start, end, label) {
                console.log('Date range selected:', start.format('YYYY-MM-DD'), 'to', end.format('YYYY-MM-DD'));
                loadDashboardData(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
            });
        }
    }

    // Initialize time period buttons
    function initTimePeriodButtons() {
        $('.custom-btn-group .btn').on('click', function(e) {
            e.preventDefault();
            $('.custom-btn-group .btn').removeClass('active');
            $(this).addClass('active');
            
            currentPeriod = $(this).data('period');
            loadChartData(currentPeriod);
        });
    }

    // Initialize Sales & Purchase Chart
    function initSalesChart() {
        const chartContainer = document.getElementById('sales-daychart');
        if (!chartContainer) return;

        const options = {
            series: [
                {
                    name: 'Sales',
                    data: [18, 20, 10, 18, 25, 18, 10, 20, 40, 8, 30, 20]
                },
                {
                    name: 'Purchase',
                    data: [40, 30, 30, 50, 40, 50, 30, 30, 50, 30, 40, 30]
                }
            ],
            chart: {
                type: 'bar',
                height: 260,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: ['2 am', '4 am', '6 am', '8 am', '10 am', '12 am', '14 pm', '16 pm', '18 pm', '20 pm', '22 pm', '24 pm']
            },
            yaxis: {
                title: {
                    text: 'Amount'
                }
            },
            fill: {
                opacity: 1,
                colors: ['#fe9f43', '#ffe3cb']
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "$ " + val + "K"
                    }
                }
            },
            legend: {
                show: false
            },
            grid: {
                borderColor: '#e5e7eb',
                strokeDashArray: 5
            }
        };

        salesChart = new ApexCharts(chartContainer, options);
        salesChart.render();
    }

    // Initialize Customer Chart
    function initCustomerChart() {
        const chartContainer = document.getElementById('customer-chart');
        if (!chartContainer) return;

        const options = {
            series: [70, 70],
            chart: {
                type: 'radialBar',
                height: 153,
                offsetY: 0
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '40%'
                    },
                    track: {
                        background: 'rgba(230,234,237,0.85)',
                        strokeWidth: '100%'
                    },
                    dataLabels: {
                        show: false
                    }
                }
            },
            colors: ['#e04f16', '#0e9384'],
            labels: ['First Time', 'Return'],
            stroke: {
                lineCap: 'round'
            }
        };

        customerChart = new ApexCharts(chartContainer, options);
        customerChart.render();
    }

    // Load chart data based on period
    function loadChartData(period) {
        // Map period to date range
        const periodMap = {
            '1D': { days: 1 },
            '1W': { days: 7 },
            '1M': { days: 30 },
            '3M': { days: 90 },
            '6M': { days: 180 },
            '1Y': { days: 365 }
        };

        const range = periodMap[period] || periodMap['1Y'];
        const endDate = moment();
        const startDate = moment().subtract(range.days, 'days');

        // Check if frappe is available
        if (typeof frappe === 'undefined' || !frappe.call) {
            console.warn('Frappe not available, using sample data');
            return;
        }
        
        frappe.call({
            method: 'new_theme.api.dashboard.get_chart_data',
            args: {
                start_date: startDate.format('YYYY-MM-DD'),
                end_date: endDate.format('YYYY-MM-DD'),
                period: period
            },
            callback: function(r) {
                if (r.message && salesChart) {
                    updateSalesChart(r.message);
                }
            }
        });
    }

    // Update sales chart with new data
    function updateSalesChart(data) {
        if (!salesChart || !data) return;

        salesChart.updateOptions({
            series: [
                {
                    name: 'Sales',
                    data: data.sales || []
                },
                {
                    name: 'Purchase',
                    data: data.purchase || []
                }
            ],
            xaxis: {
                categories: data.categories || []
            }
        });
    }

    // Load dashboard data
    function loadDashboardData(startDate, endDate) {
        // Check if frappe is available
        if (typeof frappe === 'undefined' || !frappe.call) {
            console.warn('Frappe not available, skipping data load');
            return;
        }
        
        frappe.call({
            method: 'new_theme.api.dashboard.get_dashboard_data',
            args: {
                start_date: startDate,
                end_date: endDate
            },
            callback: function(r) {
                if (r.message) {
                    updateDashboardMetrics(r.message);
                }
            }
        });
    }

    // Update dashboard metrics
    function updateDashboardMetrics(data) {
        // Update main metric cards
        if (data.total_sales !== undefined) {
            $('.sale-widget.bg-primary h4').text('$' + formatNumber(data.total_sales));
        }
        if (data.total_sales_return !== undefined) {
            $('.sale-widget.bg-secondary h4').text('$' + formatNumber(data.total_sales_return));
        }
        if (data.total_purchase !== undefined) {
            $('.sale-widget.bg-teal h4').text('$' + formatNumber(data.total_purchase));
        }
        if (data.total_purchase_return !== undefined) {
            $('.sale-widget.bg-info h4').text('$' + formatNumber(data.total_purchase_return));
        }
        
        // Update revenue cards
        if (data.profit !== undefined) {
            $('.revenue-widget').eq(0).find('h4').text('$' + formatNumber(data.profit));
        }
        if (data.invoice_due !== undefined) {
            $('.revenue-widget').eq(1).find('h4').text('$' + formatNumber(data.invoice_due));
        }
        if (data.total_expenses !== undefined) {
            $('.revenue-widget').eq(2).find('h4').text('$' + formatNumber(data.total_expenses));
        }
        if (data.payment_returns !== undefined) {
            $('.revenue-widget').eq(3).find('h4').text('$' + formatNumber(data.payment_returns));
        }
        
        // Update orders count
        if (data.orders_today !== undefined) {
            $('.fw-medium .text-primary').text(data.orders_today + '+');
        }
        
        // Update overall information
        if (data.suppliers_count !== undefined) {
            $('.info-item').eq(0).find('h5').text(formatNumber(data.suppliers_count));
        }
        if (data.customers_count !== undefined) {
            $('.info-item').eq(1).find('h5').text(formatNumber(data.customers_count));
        }
        if (data.total_orders !== undefined) {
            $('.info-item').eq(2).find('h5').text(formatNumber(data.total_orders));
        }
    }

    // Format number with commas
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Initialize dropdowns
    function initDropdowns() {
        $('.dropdown-toggle').on('click', function(e) {
            e.preventDefault();
            const dropdown = $(this).next('.dropdown-menu');
            $('.dropdown-menu').not(dropdown).hide();
            dropdown.toggle();
        });

        // Close dropdowns when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.dropdown').length) {
                $('.dropdown-menu').hide();
            }
        });
    }

    // Initialize alert dismiss
    function initAlertDismiss() {
        $('.alert .btn-close').on('click', function() {
            $(this).closest('.alert').fadeOut(300);
        });
    }

    // Initialize on DOM ready
    $(document).ready(function() {
        initDateRangePicker();
        initTimePeriodButtons();
        initSalesChart();
        initCustomerChart();
        initDropdowns();
        initAlertDismiss();
        
        // Load initial data
        const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD');
        loadDashboardData(startDate, endDate);
        loadChartData(currentPeriod);
    });

})();
