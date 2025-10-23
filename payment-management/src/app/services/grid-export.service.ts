import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridExportService {

  constructor() { }
exportAsExcel(gridApi: any, fileName: string = 'export.csv') {
    if (!gridApi) return;
    
    gridApi.exportDataAsCsv({
      fileName: fileName,
      processCellCallback: (params: any) => {
        let value = params.value;
        
        // Handle array values (like PO/SO numbers)
        if (Array.isArray(value)) {
          value = value[0] || '';
        }
        
        // Handle object values (extract display name)
        if (value && typeof value === 'object') {
          value = value.name || value.locationName || value.username || value._id || '';
        }
        
        return value != null ? value.toString() : '';
      }
    });     
  }}
