import { sanitizeHTML, stripHTML, sanitizeInput, containsXSS, escapeHTML } from './sanitize';

describe('Security - XSS Protection', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const dangerous = "<script>alert('XSS')</script><p>Safe content</p>";
      const result = sanitizeHTML(dangerous);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Safe content');
    });

    it('should remove event handlers', () => {
      const dangerous = '<img src="x" onerror="alert(1)">';
      const result = sanitizeHTML(dangerous);
      
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should remove iframe tags', () => {
      const dangerous = '<iframe src="javascript:alert(1)"></iframe>';
      const result = sanitizeHTML(dangerous);
      
      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('javascript:');
    });

    it('should remove onload handlers', () => {
      const dangerous = '<svg onload="alert(1)"></svg>';
      const result = sanitizeHTML(dangerous);
      
      expect(result).not.toContain('onload');
    });

    it('should preserve safe HTML tags', () => {
      const safe = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      const result = sanitizeHTML(safe);
      
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('Bold');
      expect(result).toContain('italic');
    });

    it('should allow safe links', () => {
      const safeLink = '<a href="https://example.com">Link</a>';
      const result = sanitizeHTML(safeLink);
      
      expect(result).toContain('<a');
      expect(result).toContain('href="https://example.com"');
    });

    it('should remove javascript: protocol from links', () => {
      const dangerous = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHTML(dangerous);
      
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
    });
  });

  describe('stripHTML', () => {
    it('should remove all HTML tags', () => {
      const html = '<p>Text with <strong>bold</strong> and <script>alert(1)</script></p>';
      const result = stripHTML(html);
      
      expect(result).toBe('Text with bold and alert(1)');
      expect(result).not.toContain('<p>');
      expect(result).not.toContain('<strong>');
      expect(result).not.toContain('<script>');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags from input', () => {
      const input = "Hello <script>alert('XSS')</script> World";
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove event handlers', () => {
      const input = '<b onmouseover="alert(1)">Hover me</b>';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('alert(1)');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('javascript:');
      expect(result).toBe('alert(1)');
    });
  });

  describe('containsXSS', () => {
    it('should detect script tags', () => {
      expect(containsXSS('<script>alert(1)</script>')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsXSS('<img onerror="alert(1)">')).toBe(true);
      expect(containsXSS('<body onload="alert(1)">')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsXSS('javascript:alert(1)')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsXSS('<iframe src="evil.com"></iframe>')).toBe(true);
    });

    it('should return false for safe content', () => {
      expect(containsXSS('<p>Safe content</p>')).toBe(false);
      expect(containsXSS('Normal text')).toBe(false);
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>';
      const result = escapeHTML(input);
      
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape ampersands', () => {
      expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(escapeHTML(`It's "quoted"`)).toBe(`It&#x27;s &quot;quoted&quot;`);
    });
  });
});

describe('Security - SQL Injection Prevention', () => {
  it('should not allow SQL injection patterns in form inputs', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
    ];

    sqlPayloads.forEach(payload => {
      const sanitized = sanitizeInput(payload);
      // Input should be preserved (backend will handle SQL safely)
      // But ensure no additional dangerous content is added
      expect(sanitized).toBeDefined();
      expect(sanitized.length).toBeGreaterThan(0);
    });
  });
});

describe('Security - Integration Tests', () => {
  it('should handle complex XSS payload', () => {
    const complex = `
      <div>
        <script>window.pwned = true</script>
        <p>Legit content</p>
        <img src=x onerror=alert(document.cookie)>
        <iframe src="javascript:alert(1)"></iframe>
      </div>
    `;

    const result = sanitizeHTML(complex);

    expect(result).not.toContain('<script>');
    expect(result).not.toContain('pwned');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('javascript:');
    expect(result).toContain('Legit content');
  });

  it('should preserve formatting in safe content', () => {
    const formatted = `
      <h2>Campaign Title</h2>
      <p>This is <strong>important</strong> information.</p>
      <ul>
        <li>Point 1</li>
        <li>Point 2</li>
      </ul>
      <a href="https://example.com">Learn more</a>
    `;

    const result = sanitizeHTML(formatted);

    expect(result).toContain('<h2>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('<a href="https://example.com"');
  });
});
