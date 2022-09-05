import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from "@angular/router";
import { MsPaintComponent } from "./ms-paint.component";

const routes:Routes = [
  {path:'', component:MsPaintComponent}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MsPaintModule { }
