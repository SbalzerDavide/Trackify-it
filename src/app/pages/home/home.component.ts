import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Profile, SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  supabaseService = inject(SupabaseService)

}
