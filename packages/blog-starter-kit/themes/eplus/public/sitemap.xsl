<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:strip-space elements="*"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta name="robots" content="noindex, follow"/>
        <title>XML Sitemap</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --color-bg: #f8fafc;
            --color-surface: #ffffff;
            --color-border: #e2e8f0;
            --color-text: #1e293b;
            --color-muted: #64748b;
            --color-accent: #2563eb;
            --color-accent-hover: #1d4ed8;
            --color-row-hover: #f1f5f9;
            --color-badge-bg: #eff6ff;
            --color-badge-text: #1d4ed8;
            --radius: 8px;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 14px;
            background: var(--color-bg);
            color: var(--color-text);
            line-height: 1.6;
            padding: 32px 24px 64px;
          }

          .wrapper {
            max-width: 1100px;
            margin: 0 auto;
          }

          /* Header */
          header {
            margin-bottom: 28px;
          }
          header h1 {
            font-size: 28px;
            font-weight: 700;
            color: var(--color-text);
            letter-spacing: -0.02em;
            margin-bottom: 6px;
          }
          header p {
            color: var(--color-muted);
            font-size: 14px;
          }
          header a {
            color: var(--color-accent);
            text-decoration: none;
          }
          header a:hover { text-decoration: underline; }

          /* Stats bar */
          .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 24px;
          }
          .stat-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--color-badge-bg);
            color: var(--color-badge-text);
            border: 1px solid #bfdbfe;
            border-radius: 999px;
            padding: 4px 12px;
            font-size: 13px;
            font-weight: 600;
          }

          /* Table */
          .table-wrap {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead tr {
            background: #f1f5f9;
            border-bottom: 1px solid var(--color-border);
          }
          th {
            text-align: left;
            padding: 11px 16px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--color-muted);
            white-space: nowrap;
          }
          tbody tr {
            border-bottom: 1px solid var(--color-border);
            transition: background 0.12s;
          }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: var(--color-row-hover); }
          td {
            padding: 10px 16px;
            vertical-align: middle;
          }

          /* URL column */
          td.url-cell {
            word-break: break-all;
          }
          td.url-cell a {
            color: var(--color-accent);
            text-decoration: none;
            font-size: 13.5px;
          }
          td.url-cell a:hover {
            color: var(--color-accent-hover);
            text-decoration: underline;
          }

          /* Numeric cells */
          td.num {
            text-align: center;
            color: var(--color-muted);
            font-variant-numeric: tabular-nums;
          }

          /* Date cell */
          td.date {
            white-space: nowrap;
            color: var(--color-muted);
            font-variant-numeric: tabular-nums;
            font-size: 13px;
          }

          /* Priority cell */
          td.priority {
            text-align: center;
          }
          .prio-bar {
            display: inline-block;
            height: 6px;
            background: var(--color-accent);
            border-radius: 3px;
            opacity: 0.7;
            min-width: 4px;
          }

          /* Empty state */
          .empty {
            padding: 40px;
            text-align: center;
            color: var(--color-muted);
          }

          /* Footer note */
          .note {
            margin-top: 20px;
            font-size: 12px;
            color: var(--color-muted);
            text-align: center;
          }
          .note a { color: var(--color-accent); text-decoration: none; }
          .note a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <xsl:apply-templates/>
          <p class="note">
            This is an XML sitemap rendered for human readability. &#160;
            <a href="/sitemap">View HTML Sitemap</a>
            &#160;·&#160;
            <a href="https://www.sitemaps.org/protocol.html" target="_blank" rel="noopener">Sitemap protocol</a>
          </p>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- ====== SITEMAP INDEX ====== -->
  <xsl:template match="sitemap:sitemapindex">
    <header>
      <h1>XML Sitemap Index</h1>
      <p>
        This sitemap index contains
        <strong><xsl:value-of select="count(sitemap:sitemap)"/></strong>
        sitemaps.
      </p>
    </header>

    <div class="stats">
      <span class="stat-badge">
        <xsl:value-of select="count(sitemap:sitemap)"/> sitemaps
      </span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:60px">#</th>
            <th>Sitemap URL</th>
            <th style="width:200px">Last Modified</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="sitemap:sitemap">
            <tr>
              <td class="num"><xsl:value-of select="position()"/></td>
              <td class="url-cell">
                <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
              </td>
              <td class="date">
                <xsl:value-of select="sitemap:lastmod"/>
              </td>
            </tr>
          </xsl:for-each>
          <xsl:if test="count(sitemap:sitemap) = 0">
            <tr><td class="empty" colspan="3">No sitemaps found.</td></tr>
          </xsl:if>
        </tbody>
      </table>
    </div>
  </xsl:template>

  <!-- ====== URL SET ====== -->
  <xsl:template match="sitemap:urlset">
    <header>
      <h1>XML Sitemap</h1>
      <p>
        This sitemap contains
        <strong><xsl:value-of select="count(sitemap:url)"/></strong>
        URLs.
      </p>
    </header>

    <div class="stats">
      <span class="stat-badge">
        <xsl:value-of select="count(sitemap:url)"/> URLs
      </span>
      <xsl:if test="count(sitemap:url/image:image) &gt; 0">
        <span class="stat-badge">
          <xsl:value-of select="count(sitemap:url/image:image)"/> images
        </span>
      </xsl:if>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:50px">#</th>
            <th>URL</th>
            <xsl:if test="sitemap:url/image:image">
              <th style="width:80px; text-align:center">Images</th>
            </xsl:if>
            <th style="width:80px; text-align:center">Priority</th>
            <th style="width:200px">Last Mod.</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="sitemap:url">
            <tr>
              <td class="num"><xsl:value-of select="position()"/></td>
              <td class="url-cell">
                <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
              </td>
              <xsl:if test="../sitemap:url/image:image">
                <td class="num">
                  <xsl:value-of select="count(image:image)"/>
                </td>
              </xsl:if>
              <td class="priority">
                <xsl:variable name="prio" select="number(sitemap:priority)"/>
                <xsl:variable name="width" select="round($prio * 60)"/>
                <div class="prio-bar" style="width:{$width}px" title="{sitemap:priority}"/>
              </td>
              <td class="date">
                <xsl:value-of select="sitemap:lastmod"/>
              </td>
            </tr>
          </xsl:for-each>
          <xsl:if test="count(sitemap:url) = 0">
            <tr><td class="empty" colspan="5">No URLs found.</td></tr>
          </xsl:if>
        </tbody>
      </table>
    </div>
  </xsl:template>

</xsl:stylesheet>
