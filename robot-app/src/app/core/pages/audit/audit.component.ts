import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, filter, first, map, Observable, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { Field, Model, Relationship } from 'src/app/model/Model';
import { SearchOptions } from 'src/app/model/utils/SearchOptions';
import { ModelUtils } from 'src/app/model/utils/ModelUtils';
import { RequestModel } from 'src/app/model/utils/RequestModel';
import { ResponseModel } from 'src/app/model/utils/ResponseModel';
import { AlertService } from 'src/app/shared/services/alert.service';
import { OptionsService } from 'src/app/shared/services/options.service';
import { ProgressService } from 'src/app/shared/services/progress.service';
import { EditionService } from 'src/app/edition/services/edition.service';
import { I } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss'],
  preserveWhitespaces: true
})
export class AuditComponent implements OnInit {

  @ViewChild('drawer') drawer!: MatDrawer;

  routeSubscription!: Subscription;
  editionMode: ('list' | 'create' | 'edit' | 'copy') = 'list';

  model!: Model;
  modelEdit: any;

  items$: Observable<Model[]> = new Observable<Model[]>();
  itemsWithoutFilters$: Observable<Model[]> = new Observable<Model[]>();
  error$ = new Subject<boolean>();
  
  searchOptions: SearchOptions = {
    page: 0,
    limit: 99,
    order: 'desc',
    orderBy: 'createdAt'
  }
  
  /**
   * Elements for Filter Component:
   */
  showFilter = true;
  filterObject: any = {};
  formFilter: FormGroup;
  relationships: Relationship[] = [];

  constructor(
    private editionService: EditionService,
    private optionsService: OptionsService,
    private progressService: ProgressService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute) {
      this.formFilter = new FormGroup({})
  }
  
  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(async (params: any) => {
      const modelName = 'Audit';
      this.editionService.getAttributes({model: modelName}).subscribe(model => {
        this.model = model as any;
        if (!this.model) {
          this.alertService.modalError("There is no valid model selected.");
        } else {
          this.buildFilterFields();
          this.onRefresh();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  onRefresh() {
    this.drawer.close();
    this.progressService.showLoading();
    this.clearFilter();
    const requestModel: RequestModel = {
      model: this.model.modelName,
      data: this.model,
      searchOptions: this.searchOptions
    };
    this.items$ = this.editionService.find(requestModel)
      .pipe(
        map((response: any) => response.data),
        catchError(error => {
          console.error('error', error)
          this.alertService.toastError("Error on getting data.")
          return of([])
        })
      );
    this.items$.subscribe({ complete: () => this.progressService.hideLoading() });
    this.itemsWithoutFilters$ = this.items$;
  }

  onCreate(): void {
    this.editionMode = 'create';
    this.modelEdit = ModelUtils.parseModel(this.model, {});
    this.drawer.open();
  }

  onEdit(model: Model): void {
    this.editionMode = 'edit';
    this.modelEdit = ModelUtils.parseModel(this.model, model);
    this.drawer.open();
  }

  onCopy(model: Model): void {
    this.editionMode = 'copy';
    const modelCopy: any = Object.assign({}, model);
    delete modelCopy[this.model.idField];
    this.modelEdit = ModelUtils.parseModel(this.model, modelCopy);
    this.drawer.open();
  }

  onCancel(event: any) {
    this.onExitEditMode();
    this.drawer.close();
  }

  onExitEditMode() {
    this.editionMode = 'list';
    this.modelEdit = Object.assign({});
  }

  onSave(modelEdit: any) {
    if (['create', 'copy'].includes(this.editionMode)) {
      this.progressService.showLoading();
      this.editionService.create(ModelUtils.parseToRequest(this.model.modelName, modelEdit)).subscribe(this.performAction('Create'));
    } else if ('edit' === this.editionMode) {
      this.progressService.showLoading();
      this.editionService.update(ModelUtils.parseToRequest(this.model.modelName, modelEdit)).subscribe(this.performAction('Update'));
    }
  }

  onDelete(model: Model): void {
    this.modelEdit = model;
    this.alertService.prompt().subscribe({
      next: () => this.delete()
    });
  }

  delete() {
    this.progressService.showLoading();
    this.editionService.delete(
      ModelUtils.parseToRequest(this.model.modelName, this.modelEdit[this.model.idField])).subscribe(this.performAction('Delete'));
  }

  beautifyName(name?: string) {
    return name?.replace(/([A-Z])/g, ' $1').trim().toUpperCase() ?? '';
  }

  getValues(item: any, column: any) {
    const value = item[column.name];
    if (column.type === 'date' && value) {
      return new Date(value).toLocaleString();
    }
    return value;
  }

  getLength(item: any, column: any) {
    const object = this.getValues(item, column)
    if (!object) return 0
    return Object.keys(object).length
  }

  getString(item: any, column: any) {
    const object = this.getValues(item, column)
    if (!object) return ''
    return JSON.stringify(object)
  }

  performAction(actionName: string) {
    return {
      next: () => this.alertService.toastSuccess(`${actionName} action performed with success!`),
      error: (error: any) => {
        this.alertService.toastError(`${actionName} action performed with error! ${error.message}`);
        this.progressService.hideLoading();
      },
      complete: () => {
        this.onRefresh();
        this.progressService.hideLoading();
        this.drawer.close();
      }
    }
  }

  /**
   * Component: Dynamic Filters
   */

  buildFilterFields() {
    const formGroup: any = {};
    this.getItemsToFilter(this.model.fields).forEach((field: Field) => {
      const validators: any[] = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.length) {
        validators.push(Validators.maxLength(field.length));
      }
      formGroup[field.name] = [null, validators];
    });
    this.formFilter = this.formBuilder.group(formGroup);
    this.initFilters()
    this.getRelationships()
  }

  getItemsToFilter(fields: any): any[] {
    return fields?.filter((f: any) => !['previousValues', 'currentValues'].includes(f.name))
  }

  initFilters() {
    Object.keys(this.formFilter.controls).forEach((element: any) => {
      const formElement: any = this.formFilter.get(element) || {};
      formElement.valueChanges
        .pipe(
          map((value: string) => (typeof value == 'string') ? value.trim() : value),
          // filter((value: string) => value.length > 1),
          debounceTime(200),
          distinctUntilChanged()
        ).subscribe((filter: any) => this.filterItems(element, filter));
    });
  }

  filterItems(filterElement: any, filterValue: any) {
    if (filterValue && filterValue != 'null') {
      this.filterObject[filterElement] = filterValue;
    } else {
      delete  this.filterObject[filterElement];
    }
    this.items$ = this.itemsWithoutFilters$;
    this.items$ = this.items$.pipe(
      map((mapObject: any) => mapObject?.filter((item: any) => {
        // percorrer todos os campos de filtro preenchidos e filtrar os itens utilizando regra AND
        let matches = 0;
        Object.keys(this.filterObject).forEach((filterItem: string) => {
          let itemValue = item[filterItem] || '';
          const filterObjectValue = this.filterObject[filterItem] || '';
          if (filterObjectValue instanceof Date) {
            const dateCompare = formatDate(filterObjectValue,'yyyy-MM-dd','en_US');
            const formattedDate = formatDate(itemValue,'yyyy-MM-dd','en_US');
            if (formattedDate === dateCompare) {
              matches++;
            }
          } else if (typeof filterObjectValue === 'string') {
            if (itemValue.toLowerCase().startsWith(filterObjectValue.toLowerCase())) {
              matches++;
            }
          }
        })
        return matches === Object.keys(this.filterObject).length;
      }))
    );
  }

  clearFilter() {
    this.items$ = this.itemsWithoutFilters$;
    Object.keys(this.formFilter!.controls).forEach((element: any) => {
      this.formFilter!.get(element)?.setValue(null);
    });
  }

  showHideFilter(param: boolean) {
    this.showFilter = param;
  }

  getRelationships() {
    this.model.fields.forEach((field: Field) => {
      if (field.type.includes('relationship')) {
        const relationship = Object.assign({}, field.relationship);
        const request = <RequestModel> {
          model: relationship.name
        };
        this.progressService.showLoading();
        this.optionsService.list(request).pipe(
          catchError(error => {
            console.error('error', error)
            // this.alertService.modalSuccess({} as BsModalRef, error.message);
            this.alertService.toastError(error.message);
            this.progressService.hideLoading();
            return of()
          })
        ).subscribe((response: any) => {
          relationship.data = response.data;
          this.relationships.push(relationship);
          this.progressService.hideLoading();
        });
      }
    });
  }
  
  getOptions(relationshipName: string) {
    const filtered: Relationship[] = this.relationships?.filter((i) => i.name === relationshipName) ?? [];
    return filtered[0]?.data ?? [];
  }

  getShowFields(relationshipName: string, data: any): string {
    const filtered: Relationship[] = this.relationships?.filter((i) => i.name === relationshipName) ?? [];
    const showFields = filtered[0]?.showFields ?? [];
    let show = '';
    showFields.forEach((field, index) => {
      if (index > 0) {
        show += ` - ${data[field]}`;
      } else {
        show += `${data[field]}`;
      }
    });
    return show;
  }

}
