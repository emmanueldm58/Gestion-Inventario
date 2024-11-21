const generarReporte = () => {
    const ws = XLSX.utils.json_to_sheet(productos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte de Productos");
    XLSX.writeFile(wb, "Reporte_Productos.xlsx");
};
