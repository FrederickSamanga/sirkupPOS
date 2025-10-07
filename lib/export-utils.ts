import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
// import { ReportData } from '@/app/(authenticated)/reports/page'
type ReportData = any

export class ReportExporter {
  private data: ReportData
  private dateRange: { from: Date; to: Date }

  constructor(data: ReportData, dateRange: { from: Date; to: Date }) {
    this.data = data
    this.dateRange = dateRange
  }

  // Export to PDF
  async exportToPDF(reportType: string = 'executive') {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Header
    pdf.setFontSize(20)
    pdf.text('SirkupAI Cafe POS - Analytics Report', pageWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(12)
    pdf.text(`${format(this.dateRange.from, 'MMM dd, yyyy')} - ${format(this.dateRange.to, 'MMM dd, yyyy')}`, pageWidth / 2, 30, { align: 'center' })

    pdf.setFontSize(10)
    pdf.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth / 2, 37, { align: 'center' })

    let yPosition = 50

    // Executive Summary Section
    pdf.setFontSize(16)
    pdf.text('Executive Summary', 14, yPosition)
    yPosition += 10

    // Key Metrics Table
    const metricsData = [
      ['Total Revenue', `$${this.data.sales.total.toLocaleString()}`, `+${this.data.sales.growth}%`],
      ['Total Orders', this.data.sales.count.toString(), '+8.5%'],
      ['Customers', this.data.customers.total.toString(), '+12.3%'],
      ['Avg Order Value', `$${this.data.customers.avgOrderValue.toFixed(2)}`, '+5.2%'],
      ['Profit Margin', `${this.data.financial.profitMargin}%`, '+2.1%'],
    ]

    autoTable(pdf, {
      head: [['Metric', 'Value', 'Change']],
      body: metricsData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Sales by Category
    pdf.setFontSize(14)
    pdf.text('Sales by Category', 14, yPosition)
    yPosition += 8

    const categoryData = this.data.sales.byCategory.map(cat => [
      cat.name,
      `$${cat.value.toLocaleString()}`,
      `${((cat.value / this.data.sales.total) * 100).toFixed(1)}%`,
    ])

    autoTable(pdf, {
      head: [['Category', 'Revenue', '% of Total']],
      body: categoryData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Top Products
    if (yPosition + 50 > pageHeight) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(14)
    pdf.text('Top Selling Products', 14, yPosition)
    yPosition += 8

    const productData = this.data.products.topSelling.map((product, index) => [
      (index + 1).toString(),
      product.name,
      product.quantity.toString(),
      `$${product.revenue.toLocaleString()}`,
    ])

    autoTable(pdf, {
      head: [['Rank', 'Product', 'Quantity Sold', 'Revenue']],
      body: productData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 9 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Staff Performance
    if (yPosition + 50 > pageHeight) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(14)
    pdf.text('Staff Performance', 14, yPosition)
    yPosition += 8

    const staffData = this.data.staff.performance.map((staff, index) => [
      (index + 1).toString(),
      staff.name,
      staff.orders.toString(),
      `$${staff.revenue.toLocaleString()}`,
      `${staff.efficiency}%`,
    ])

    autoTable(pdf, {
      head: [['Rank', 'Name', 'Orders', 'Revenue', 'Efficiency']],
      body: staffData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
      styles: { fontSize: 9 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Financial Summary
    if (yPosition + 60 > pageHeight) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(14)
    pdf.text('Financial Summary', 14, yPosition)
    yPosition += 8

    const financialData = [
      ['Total Revenue', `$${this.data.financial.revenue.toLocaleString()}`],
      ['Operating Costs', `$${this.data.financial.costs.toLocaleString()}`],
      ['Net Profit', `$${this.data.financial.profit.toLocaleString()}`],
      ['Profit Margin', `${this.data.financial.profitMargin}%`],
      ['Taxes', `$${this.data.financial.taxes.toLocaleString()}`],
      ['Tips', `$${this.data.financial.tips.toLocaleString()}`],
    ]

    autoTable(pdf, {
      head: [['Metric', 'Amount']],
      body: financialData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    })

    // Footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Save the PDF
    const fileName = `sirkupai-cafe-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`
    pdf.save(fileName)
  }

  // Export to Excel
  async exportToExcel(includeCharts: boolean = false) {
    const wb = XLSX.utils.book_new()

    // Executive Summary Sheet
    const summaryData = [
      ['SirkupAI Cafe POS - Analytics Report'],
      [`Period: ${format(this.dateRange.from, 'MMM dd, yyyy')} - ${format(this.dateRange.to, 'MMM dd, yyyy')}`],
      [],
      ['Key Metrics'],
      ['Metric', 'Value', 'Change'],
      ['Total Revenue', this.data.sales.total, `${this.data.sales.growth}%`],
      ['Total Orders', this.data.sales.count, '8.5%'],
      ['Total Customers', this.data.customers.total, '12.3%'],
      ['Avg Order Value', this.data.customers.avgOrderValue, '5.2%'],
      ['Profit Margin', `${this.data.financial.profitMargin}%`, '2.1%'],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

    // Sales Data Sheet
    const salesHeaders = ['Hour', 'Sales Amount']
    const salesData = this.data.sales.byHour.map(item => [item.hour, item.value])
    const salesSheet = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesData])
    XLSX.utils.book_append_sheet(wb, salesSheet, 'Hourly Sales')

    // Daily Sales Sheet
    const dailyHeaders = ['Day', 'Sales Amount']
    const dailyData = this.data.sales.byDay.map(item => [item.day, item.value])
    const dailySheet = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyData])
    XLSX.utils.book_append_sheet(wb, dailySheet, 'Daily Sales')

    // Category Sales Sheet
    const categoryHeaders = ['Category', 'Revenue', 'Percentage']
    const categoryData = this.data.sales.byCategory.map(cat => [
      cat.name,
      cat.value,
      ((cat.value / this.data.sales.total) * 100).toFixed(1),
    ])
    const categorySheet = XLSX.utils.aoa_to_sheet([categoryHeaders, ...categoryData])
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Sales')

    // Products Sheet
    const productHeaders = ['Product Name', 'Quantity Sold', 'Revenue']
    const productData = this.data.products.topSelling.map(product => [
      product.name,
      product.quantity,
      product.revenue,
    ])
    const productSheet = XLSX.utils.aoa_to_sheet([productHeaders, ...productData])
    XLSX.utils.book_append_sheet(wb, productSheet, 'Products')

    // Staff Performance Sheet
    const staffHeaders = ['Staff Name', 'Orders', 'Revenue', 'Efficiency %']
    const staffData = this.data.staff.performance.map(staff => [
      staff.name,
      staff.orders,
      staff.revenue,
      staff.efficiency,
    ])
    const staffSheet = XLSX.utils.aoa_to_sheet([staffHeaders, ...staffData])
    XLSX.utils.book_append_sheet(wb, staffSheet, 'Staff Performance')

    // Customer Analytics Sheet
    const customerHeaders = ['Customer Name', 'Orders', 'Total Spent']
    const customerData = this.data.customers.topCustomers.map(customer => [
      customer.name,
      customer.orders,
      customer.spent,
    ])
    const customerSheet = XLSX.utils.aoa_to_sheet([customerHeaders, ...customerData])
    XLSX.utils.book_append_sheet(wb, customerSheet, 'Customers')

    // Financial Sheet
    const financialData = [
      ['Financial Summary'],
      [],
      ['Revenue', this.data.financial.revenue],
      ['Costs', this.data.financial.costs],
      ['Profit', this.data.financial.profit],
      ['Profit Margin %', this.data.financial.profitMargin],
      ['Taxes', this.data.financial.taxes],
      ['Tips', this.data.financial.tips],
      ['Discounts', this.data.financial.discounts],
      ['Refunds', this.data.financial.refunds],
    ]
    const financialSheet = XLSX.utils.aoa_to_sheet(financialData)
    XLSX.utils.book_append_sheet(wb, financialSheet, 'Financial')

    // Operational Metrics Sheet
    const operationalData = [
      ['Operational Metrics'],
      [],
      ['Table Utilization %', this.data.operational.tableUtilization],
      ['Avg Turnover Time (min)', this.data.operational.avgTurnoverTime],
      ['Kitchen Efficiency %', this.data.operational.kitchenEfficiency],
      ['Waste Percentage %', this.data.operational.wastePercentage],
      [],
      ['Peak Hours'],
      ['Hour', 'Orders'],
      ...this.data.operational.peakHours.map(hour => [hour.hour, hour.orders]),
    ]
    const operationalSheet = XLSX.utils.aoa_to_sheet(operationalData)
    XLSX.utils.book_append_sheet(wb, operationalSheet, 'Operations')

    // Write and save the file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
    const buf = new ArrayBuffer(wbout.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xff
    }

    const fileName = `sirkupai-cafe-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), fileName)
  }

  // Export to CSV
  async exportToCSV(dataType: string = 'sales') {
    let csvContent = ''
    let fileName = ''

    switch (dataType) {
      case 'sales':
        csvContent = 'Hour,Sales Amount\n'
        csvContent += this.data.sales.byHour
          .map(item => `${item.hour},${item.value}`)
          .join('\n')
        fileName = 'sales-data.csv'
        break

      case 'products':
        csvContent = 'Product Name,Quantity Sold,Revenue\n'
        csvContent += this.data.products.topSelling
          .map(product => `${product.name},${product.quantity},${product.revenue}`)
          .join('\n')
        fileName = 'products-data.csv'
        break

      case 'customers':
        csvContent = 'Customer Name,Orders,Total Spent\n'
        csvContent += this.data.customers.topCustomers
          .map(customer => `${customer.name},${customer.orders},${customer.spent}`)
          .join('\n')
        fileName = 'customers-data.csv'
        break

      case 'staff':
        csvContent = 'Staff Name,Orders,Revenue,Efficiency\n'
        csvContent += this.data.staff.performance
          .map(staff => `${staff.name},${staff.orders},${staff.revenue},${staff.efficiency}`)
          .join('\n')
        fileName = 'staff-performance.csv'
        break

      default:
        // Export all data as CSV
        csvContent = this.getAllDataAsCSV()
        fileName = 'complete-report.csv'
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `${fileName.replace('.csv', '')}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`)
  }

  private getAllDataAsCSV(): string {
    let csv = 'SirkupAI Cafe POS - Analytics Report\n'
    csv += `Period: ${format(this.dateRange.from, 'MMM dd, yyyy')} - ${format(this.dateRange.to, 'MMM dd, yyyy')}\n\n`

    // Key Metrics
    csv += 'KEY METRICS\n'
    csv += 'Metric,Value,Change\n'
    csv += `Total Revenue,$${this.data.sales.total},${this.data.sales.growth}%\n`
    csv += `Total Orders,${this.data.sales.count},8.5%\n`
    csv += `Total Customers,${this.data.customers.total},12.3%\n`
    csv += `Avg Order Value,$${this.data.customers.avgOrderValue.toFixed(2)},5.2%\n`
    csv += `Profit Margin,${this.data.financial.profitMargin}%,2.1%\n\n`

    // Sales by Category
    csv += 'SALES BY CATEGORY\n'
    csv += 'Category,Revenue\n'
    this.data.sales.byCategory.forEach(cat => {
      csv += `${cat.name},$${cat.value}\n`
    })

    return csv
  }

  // Print report
  async printReport() {
    window.print()
  }

  // Email report (requires backend implementation)
  async emailReport(recipients: string[], format: 'pdf' | 'excel' = 'pdf') {
    // This would typically make an API call to your backend
    // which would generate and send the report via email
    console.log('Sending report to:', recipients, 'in format:', format)

    // For now, we'll just download the file
    if (format === 'pdf') {
      await this.exportToPDF('executive')
    } else {
      await this.exportToExcel(true)
    }
  }
}