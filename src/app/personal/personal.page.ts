import { Component, OnInit } from '@angular/core';

interface Personal {
  icon: string;
  name: string;
  redirecTo: string;
}

@Component({
  selector: 'app-personal',
  templateUrl: './personal.page.html',
  styleUrls: ['./personal.page.scss'],
})
export class PersonalPage implements OnInit {

  personales: Personal[] = [  
    {
      icon: "person-circle-outline",
      name: "perfil",
      redirecTo: "/perfil"
    },
  ];



  constructor() { }

  ngOnInit() {
  }

}
