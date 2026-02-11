export class ProductCandidate {
  constructor({ title, url, description, price, priceValue, imageUrl, source, searchScore, rawContent }) {
    if (!title || !url) {
      throw new Error('ProductCandidate requires title and url');
    }

    this.title = title;
    this.url = url;
    this.description = description || null;
    this.price = price || null;
    this.priceValue = priceValue || null;
    this.imageUrl = imageUrl || null;
    this.source = source || null;
    this.searchScore = searchScore || 0;
    this.rawContent = rawContent || null;
  }

  get isComplete() {
    return !!(this.title && this.url && this.imageUrl && this.description);
  }

  get hasPrice() {
    return this.priceValue !== null && this.priceValue > 0;
  }
}
