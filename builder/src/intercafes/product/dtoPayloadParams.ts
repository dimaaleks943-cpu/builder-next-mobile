export interface IGetDistributorPropertiesFilter {
  id?: number[]; //ID системного свойства (массив int)
  distributor_id?: number[]; // ID свойства поставщика (массив int)
  name?: string; //название свойства (строка, поиск по подстроке)
  type?: string[]; // list, color, boolean, float (массив строк)
  distributor_only?: boolean; // не выводить непривязанные системные свойства (bool)
}
