extern crate cfg_if;
extern crate js_sys;
extern crate wasm_bindgen;

mod utils;

use std::fmt;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
pub fn read_pattern(pattern: &str, func: &js_sys::Function) {
  let mut x = 0;
  let mut y = 0;
  let mut parameter_argument = 0;

  for c in pattern.chars() {
    let mut param = match parameter_argument {
      0 => 1,
      _ => parameter_argument,
    };

    match c {
      'b' => {
        x += param;
        parameter_argument = 0
      }
      '$' => {
        y += param;
        x = 0;
        parameter_argument = 0
      }
      'o' => {
        while param > 0 {
          param -= 1;
          x += 1;
          let _ = func.call2(&JsValue::NULL, &JsValue::from(x), &JsValue::from(y));
        }
        parameter_argument = 0
      }
      '!' => return,
      _ => {
        let num = c.to_digit(10).unwrap();

        if num <= 9 {
          parameter_argument = 10 * parameter_argument + num
        };
      }
    }
  }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
  Dead = 0,
  Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
  width: u32,
  height: u32,
  cells: Vec<Cell>,
}

impl Universe {
  fn get_index(&self, row: u32, column: u32) -> usize {
    (row * self.width + column) as usize
  }

  fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
    let mut count = 0;
    for delta_row in [self.height - 1, 0, 1].iter().cloned() {
      for delta_col in [self.width - 1, 0, 1].iter().cloned() {
        if delta_row == 0 && delta_col == 0 {
          continue;
        }

        let neighbor_row = (row + delta_row) % self.height;
        let neighbor_col = (column + delta_col) % self.height;

        let index = self.get_index(neighbor_row, neighbor_col);
        count += self.cells[index] as u8;
      }
    }
    count
  }
}

#[wasm_bindgen]
impl Universe {
  pub fn cells(&self) -> *const Cell {
    self.cells.as_ptr()
  }

  pub fn tick(&mut self) {
    let mut next = self.cells.clone();

    for row in 0..self.height {
      for col in 0..self.width {
        let index = self.get_index(row, col);
        let cell = self.cells[index];
        let live_neighbors = self.live_neighbor_count(row, col);

        let next_cell = match (cell, live_neighbors) {
          // Rule 1:
          // Any live cell with fewer than two live neighbors
          // dies, as if caused by under-population.
          (Cell::Alive, x) if x < 2 => Cell::Dead,
          // Rule 2:
          // Any live cell with two or three live neighbors
          // lives on to the next generation.
          (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
          // Rule 3:
          // Any live cell with more than three live
          // neighbors dies, as if by overpopulation.
          (Cell::Alive, x) if x > 3 => Cell::Dead,
          // Rule 4:
          // Any dead cell with exactly three live neighbors
          // becomes a live cell, as if by reproduction.
          (Cell::Dead, 3) => Cell::Alive,
          // All other cells remain in the same state.
          (otherwise, _) => otherwise,
        };

        next[index] = next_cell;
      }
    }
    self.cells = next;
  }

  pub fn new(width: u32, height: u32) -> Universe {
    let cells = (0..width * height)
      .map(|i| {
        if i % 2 == 0 || i % 7 == 0 {
          Cell::Alive
        } else {
          Cell::Dead
        }
      })
      .collect();

    Universe {
      width,
      height,
      cells,
    }
  }

  pub fn render(&self) -> String {
    self.to_string()
  }
}

impl fmt::Display for Universe {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for line in self.cells.as_slice().chunks(self.width as usize) {
      for &cell in line {
        let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
        write!(f, "{}", symbol)?;
      }
      write!(f, "\n")?;
    }
    Ok(())
  }
}
