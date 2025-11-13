class LocalStorageMap {
  private getMap<T = string>(storageKey: string): Record<string, T> {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : {};
  }

  get<T = string>(storageKey: string, key: string): T | undefined {
    const map = this.getMap<T>(storageKey);
    return map[key];
  }

  set<T = string>(storageKey: string, key: string, value: T) {
    const map = this.getMap<T>(storageKey);
    map[key] = value;
    localStorage.setItem(storageKey, JSON.stringify(map));
  }

  remove(storageKey: string, key: string) {
    const map = this.getMap(storageKey);
    delete map[key];
    localStorage.setItem(storageKey, JSON.stringify(map));
  }

  clear(storageKey: string) {
    localStorage.removeItem(storageKey);
  }

  getAll<T = string>(storageKey: string): Record<string, T> {
    return this.getMap<T>(storageKey);
  }
}

const lsMap = new LocalStorageMap();
export default lsMap;
