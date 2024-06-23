import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords'
})
export class TruncateWordsPipe implements PipeTransform {

  transform(value: string, limit: number = 25, trail: string = '...'): string {
    let result = value;
    const valueParts = value.split(/\s+/);

    if(valueParts.length > limit){
        result = valueParts.slice(0, limit).join(' ') + trail;
    }

    return result;
  }

}
