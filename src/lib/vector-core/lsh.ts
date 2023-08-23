class LSH {
    private randomProjections: number[][];
    private buckets: Map<string, number[][]> = new Map();
  
    constructor(private dimensions: number, private k: number) {
      this.randomProjections = this.generateRandomProjections();
    }
  
    private generateRandomProjections(): number[][] {
      const projections: number[][] = [];
      for (let i = 0; i < this.k; i++) {
        const randomVec = Array.from({ length: this.dimensions }, () => Math.random() * 2 - 1);
        projections.push(randomVec);
      }
      return projections;
    }
  
    computeHash(vector: number[]): string {
      let hashBits: string = "";
      for (let i = 0; i < this.k; i++) {
        const dotProduct = vector.reduce((sum, value, idx) => sum + value * this.randomProjections[i][idx], 0);
        hashBits += dotProduct >= 0 ? "1" : "0";
      }
      return hashBits;
    }
  
    insert(vector: number[]): void {
      const hash = this.computeHash(vector);
      if (!this.buckets.has(hash)) {
        this.buckets.set(hash, []);
      }
      this.buckets.get(hash)!.push(vector);
    }
  
    query(vector: number[]): number[][] {
      const hash = this.computeHash(vector);
      return this.buckets.get(hash) || [];
    }
  }
  

  export { LSH }