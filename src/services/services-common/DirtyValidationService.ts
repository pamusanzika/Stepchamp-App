import Alert from 'sweetalert2';
export default class DirtyValidationService {
  private static instance: DirtyValidationService;
  private dirtyFields: Set<string>;

  private constructor() {
    this.dirtyFields = new Set<string>();

    window.addEventListener('beforeunload', (event: any) => {
      if(this.isDirty()){
        event.returnValue = 'There are unsaved changes. Are you sure you want to leave?';
        return 'There are unsaved changes. Are you sure you want to leave?';
      }
    });
  }

  public static getInstance(): DirtyValidationService {
    if (!DirtyValidationService.instance) {
      DirtyValidationService.instance = new DirtyValidationService();
    }
    return DirtyValidationService.instance;
  }

  public markFieldAsDirty(fieldName: string) {
    this.dirtyFields.add(fieldName);
  }

  markFieldAsUndirty(fieldName: string) {
    if (this.dirtyFields.has(fieldName)) {
      this.dirtyFields.delete(fieldName);
    }
  }

  public isFieldDirty(fieldName: string) {
    return this.dirtyFields.has(fieldName);
  }

  public resetAll() {
    this.dirtyFields.clear();
  }

  public isDirty() {
    return this.dirtyFields.size > 0;
  }

  public async canCancelDirtyView() {
    if (this.dirtyFields.size > 0) {
      let userConfirmed = false;
      await Alert.fire({
        title: 'You have unsaved changes!',
        text: 'Are you sure you want to discard them?',
        showCancelButton: true,
        confirmButtonColor: '#23d856',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          userConfirmed = true
          this.resetAll();
        }
      });
      return userConfirmed;
    }
    return true;
  }

}
