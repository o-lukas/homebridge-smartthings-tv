## [3.0.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v3.0.0...v3.0.1) (2025-11-16)


### Bug Fixes

* bump @homebridge/plugin-ui-utils from 2.1.0 to 2.1.1 ([a0012ea](https://github.com/o-lukas/homebridge-smartthings-tv/commit/a0012ea2becce070eb94f8d03b58b5fe913c84f1))

# [3.0.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.8.0...v3.0.0) (2025-10-23)


### Bug Fixes

* bump ping from 0.4.4 to 1.0.0 ([9dc0124](https://github.com/o-lukas/homebridge-smartthings-tv/commit/9dc012417c7f82153a42079a80eb5d26e5999659))
* don't close wizard when configChanged callback is called ([5c13355](https://github.com/o-lukas/homebridge-smartthings-tv/commit/5c133559985afe6c4370c6e41ef7d65876adff05)), closes [#494](https://github.com/o-lukas/homebridge-smartthings-tv/issues/494)
* ensure correct token type when saving refresh token ([4ec7558](https://github.com/o-lukas/homebridge-smartthings-tv/commit/4ec75586268f512694b2aa392177886955742f56)), closes [#494](https://github.com/o-lukas/homebridge-smartthings-tv/issues/494)
* prevent null assigns of OAuth client id & secret ([d0f57b4](https://github.com/o-lukas/homebridge-smartthings-tv/commit/d0f57b49577bbcdaf747e12af1371547ad0e6d63))


### Features

* add logging to custom UI ([f1908b4](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f1908b4c84762844d5a99f704baf6b7c4a48199f))
* generate CHANGELOG.md ([7af8618](https://github.com/o-lukas/homebridge-smartthings-tv/commit/7af8618a78dd59d3ad11aa125e04c2d7b165edd2))
* make plugin ready for homebridge v2 ([1011561](https://github.com/o-lukas/homebridge-smartthings-tv/commit/10115613abf7170625080401937e3e34de5258ab))


### BREAKING CHANGES

* drop support for node v18

# [3.0.0-alpha.6](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2025-10-23)


### Bug Fixes

* ensure correct token type when saving refresh token ([1b95411](https://github.com/o-lukas/homebridge-smartthings-tv/commit/1b95411bd8b154c26c8098bf4f3496007f0e3cb0)), closes [#494](https://github.com/o-lukas/homebridge-smartthings-tv/issues/494)

# [3.0.0-alpha.5](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2025-10-23)


### Bug Fixes

* prevent null assigns of OAuth client id & secret ([5b43f4b](https://github.com/o-lukas/homebridge-smartthings-tv/commit/5b43f4b561903aa16f54f0816b6f5473781b2bc1))

# [3.0.0-alpha.4](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2025-10-22)

### Features

* generate CHANGELOG.md ([b4a545a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b4a545acebe093375f5ec66c24e0bdf28fab8762))

# [3.0.0-alpha.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2025-10-22)

### Features

* add logging to custom UI ([11e9dc1](https://github.com/o-lukas/homebridge-smartthings-tv/commit/11e9dc1b8c6311310fe2908e7cabd1691c57fb9d))

### Bug Fixes

* don't close wizard when configChanged callback is called ([0c66020](https://github.com/o-lukas/homebridge-smartthings-tv/commit/0c6602055d400f497daa16272c5f5dac5829bb0c)), closes [#494](https://github.com/o-lukas/homebridge-smartthings-tv/issues/494)

# [3.0.0-alpha.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2025-10-22)

### Features

* add logging to custom UI ([11e9dc1](https://github.com/o-lukas/homebridge-smartthings-tv/commit/11e9dc1b8c6311310fe2908e7cabd1691c57fb9d))

# [3.0.0-alpha.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.8.0...v3.0.0-alpha.1) (2025-10-12)

### ⚠ BREAKING CHANGES

* drop support for node v18

### Features

* make plugin ready for homebridge v2 ([d33c6cc](https://github.com/o-lukas/homebridge-smartthings-tv/commit/d33c6cc3a899623f7d62e7974de0b7d8a438bafc))

### Bug Fixes

* bump ping from 0.4.4 to 1.0.0 ([ec75f4a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/ec75f4adb157c6be5137a4da21d52ed16247366e))

# [2.8.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.7.3...v2.8.0) (2025-07-11)

### Features

* add switch to activate ambient mode ([e6f8d8a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/e6f8d8a8aa6923242ab232e4838d4df730426df0)), closes [#478](https://github.com/o-lukas/homebridge-smartthings-tv/issues/478)
* add switches for available ambient modes ([be40367](https://github.com/o-lukas/homebridge-smartthings-tv/commit/be40367d8ca4621e6a6c837cd92c119254cd01b0)), closes [#478](https://github.com/o-lukas/homebridge-smartthings-tv/issues/478)

### Bug Fixes

* add error message if picture/sound mode capability is missing ([5278296](https://github.com/o-lukas/homebridge-smartthings-tv/commit/5278296ee72346905dbe004a6fa4fb85db26ce0a))

# [2.7.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.7.2...v2.7.3) (2025-06-12)

### Bug Fixes

* add default empty config if none is present ([17ea070](https://github.com/o-lukas/homebridge-smartthings-tv/commit/17ea0705bcb751f3bdf3129a95ffd50af15610a6)), closes [#468](https://github.com/o-lukas/homebridge-smartthings-tv/issues/468) [#473](https://github.com/o-lukas/homebridge-smartthings-tv/issues/473)
* bump @homebridge/plugin-ui-utils from 2.0.2 to 2.1.0 ([4eded1e](https://github.com/o-lukas/homebridge-smartthings-tv/commit/4eded1e028bff9a304a30fdff1f9ccce6728b3d5))

# [2.7.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.7.1...v2.7.2) (2025-04-21)

### Bug Fixes

* bump @homebridge/plugin-ui-utils from 2.0.1 to 2.0.2 ([b459b01](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b459b015a1d4c225d2c01e94ec0287a9cf141f3a))

# [2.7.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.7.0...v2.7.1) (2025-03-30)

### Bug Fixes

* add soundbar input source warning ([7a73271](https://github.com/o-lukas/homebridge-smartthings-tv/commit/7a73271c7cbac0f411d604c5e24a0d607301bf6d))
* catch errors in capability registration ([9eac1ff](https://github.com/o-lukas/homebridge-smartthings-tv/commit/9eac1ff9430cc330b172454f789a9da0884dc31f))

# [2.7.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.6.1...v2.7.0) (2025-03-30)

### Features

* optionally register input sources as switches ([f7c6f06](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f7c6f06dbcf2502e3e08a20051167eb7606681f6)), closes [#460](https://github.com/o-lukas/homebridge-smartthings-tv/issues/460)

# [2.6.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.6.0...v2.6.1) (2025-03-21)

### Bug Fixes

* update config validation for OAuth ([695828a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/695828a4fda070def3a53cd978ee3e00df926ebe)), closes [#458](https://github.com/o-lukas/homebridge-smartthings-tv/issues/458)

# [2.6.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.5.0...v2.6.0) (2025-03-16)

### Features

* **oauth:** add custom UI for OAuth setup ([17b4f44](https://github.com/o-lukas/homebridge-smartthings-tv/commit/17b4f44b343289af15e540254728da9550b0b2c0))
* **oauth:** add support for RefreshTokenAuthenticator ([10bf82c](https://github.com/o-lukas/homebridge-smartthings-tv/commit/10bf82c1bb5409c769cbbf565d9bc4691aa049c7)), closes [#440](https://github.com/o-lukas/homebridge-smartthings-tv/issues/440)

### Bug Fixes

* bump @smartthings/core-sdk from 8.3.2 to 8.4.1 ([1327949](https://github.com/o-lukas/homebridge-smartthings-tv/commit/1327949e3a28438be91153ae2ff66ba44a65e628))
* bump dependency versions ([0263d26](https://github.com/o-lukas/homebridge-smartthings-tv/commit/0263d26bde60fc3848062faed735f4a99e758784))
* **oauth:** handle undefined values in OAuth wizard ([891415a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/891415a6203f942f856ca1284725b534a6efb63b))

# [2.5.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.4.0...v2.5.0) (2025-01-12)

### Features

* add config property for application validation ([7210c6f](https://github.com/o-lukas/homebridge-smartthings-tv/commit/7210c6fb058a56ef3d022a3d3080bcfde3808426)), closes [#438](https://github.com/o-lukas/homebridge-smartthings-tv/issues/438)

### Bug Fixes

* accessories not being published when active identifier can't be reset ([9d8decd](https://github.com/o-lukas/homebridge-smartthings-tv/commit/9d8decdf61d29e712eb1bccdd68bdf2df3be99cd))

# [2.4.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.8...v2.4.0) (2024-12-01)

### Features

* make supported device types configurable ([a013106](https://github.com/o-lukas/homebridge-smartthings-tv/commit/a0131060640e5e695044bdd6026f1827ee959577)), closes [#430](https://github.com/o-lukas/homebridge-smartthings-tv/issues/430)

# [2.3.8](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.7...v2.3.8) (2024-11-30)

### Bug Fixes

* support node v22.x ([784d906](https://github.com/o-lukas/homebridge-smartthings-tv/commit/784d9062b74c9d7dca6876a406970fa0b7ecf5ff)), closes [#428](https://github.com/o-lukas/homebridge-smartthings-tv/issues/428)

# [2.3.7](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.6...v2.3.7) (2024-10-21)

### Bug Fixes

* bump @smartthings/core-sdk from 8.3.1 to 8.3.2 ([6fbdb06](https://github.com/o-lukas/homebridge-smartthings-tv/commit/6fbdb068691ec1c47120a3c87a0199ca122d3c5f))

# [2.3.6](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.5...v2.3.6) (2024-10-03)

### Bug Fixes

* catch errors when registering capabilities ([9d32607](https://github.com/o-lukas/homebridge-smartthings-tv/commit/9d32607259e0a93937427d2af32e3ff7cd9bbe91)), closes [#410](https://github.com/o-lukas/homebridge-smartthings-tv/issues/410)

# [2.3.5](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.4...v2.3.5) (2024-10-01)

### Bug Fixes

* remove debugging values ([6a5f0bd](https://github.com/o-lukas/homebridge-smartthings-tv/commit/6a5f0bd3d78584cb5ceeb3e53900791c4c94e203))

# [2.3.4](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.3...v2.3.4) (2024-10-01)

### Bug Fixes

* handle invalid volume values ([5421170](https://github.com/o-lukas/homebridge-smartthings-tv/commit/54211702ccbe3e024e791fba9de5e90bb9de153a))
* publish all external accessory at once ([b20ac1d](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b20ac1d1b4dbc8ef6b3f97abbdd595dc89cb138c)), closes [#410](https://github.com/o-lukas/homebridge-smartthings-tv/issues/410)

# [2.3.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.2...v2.3.3) (2024-09-27)

### Bug Fixes

* replace JSON file for app declarations ([8aef6d3](https://github.com/o-lukas/homebridge-smartthings-tv/commit/8aef6d3cd67f15df33b9259846ebb874c9a43a62)), closes [#413](https://github.com/o-lukas/homebridge-smartthings-tv/issues/413)
* set UUID for external accessory context ([569ead2](https://github.com/o-lukas/homebridge-smartthings-tv/commit/569ead2d5a30f9045312f6d14c7d35352486486d)), closes [#410](https://github.com/o-lukas/homebridge-smartthings-tv/issues/410)

# [2.3.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.1...v2.3.2) (2024-09-15)

### Bug Fixes

* bump @smartthings/core-sdk from 8.2.0 to 8.3.1 ([196ab02](https://github.com/o-lukas/homebridge-smartthings-tv/commit/196ab027b2d07f58af663783803041643d0600b5))

# [2.3.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.3.0...v2.3.1) (2024-08-24)

### Bug Fixes

* use assert instead of with for import assertions ([0e32018](https://github.com/o-lukas/homebridge-smartthings-tv/commit/0e320189a821b1fae386a3006e597c54280771c8)), closes [#403](https://github.com/o-lukas/homebridge-smartthings-tv/issues/403)

# [2.3.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.2.0...v2.3.0) (2024-08-18)

### Features

* added config property to set device category ([fc7191b](https://github.com/o-lukas/homebridge-smartthings-tv/commit/fc7191b63303e6de9303ef8beadc9f799739e331))

### Bug Fixes

* make device id mandatory in schema ([697ef81](https://github.com/o-lukas/homebridge-smartthings-tv/commit/697ef81208981bf5730fa0b9fd9219b729aebaeb))
* show soundbars as TV_SET_TOP_BOX ([b17d392](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b17d39256d4cd7dc3430b0dc7d43219c9f82c147))

# [2.2.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.1.3...v2.2.0) (2024-08-18)

### Features

* implement basic support for SoundBars ([94527ed](https://github.com/o-lukas/homebridge-smartthings-tv/commit/94527edbc2a6ab41708f71fe8e15df3919a35417)), closes [#384](https://github.com/o-lukas/homebridge-smartthings-tv/issues/384)

# [2.1.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.1.2...v2.1.3) (2024-08-16)

### Bug Fixes

* bump axios to >1.7.3 ([faccda8](https://github.com/o-lukas/homebridge-smartthings-tv/commit/faccda885ca96e36c4c22c0f33550bd0b4ad5a57))

# [2.1.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.1.1...v2.1.2) (2024-07-05)

### Bug Fixes

* change log level of possible info key values ([cda1315](https://github.com/o-lukas/homebridge-smartthings-tv/commit/cda13158e23fa6262eedfc4928d06e3818ab7cca))

# [2.1.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.1.0...v2.1.1) (2024-06-30)

### Bug Fixes

* remove debugging value ([fa842d2](https://github.com/o-lukas/homebridge-smartthings-tv/commit/fa842d2c33681951d8cb79943903357a16afebc3))

# [2.1.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.0.3...v2.1.0) (2024-06-28)

### Features

* add property to control info key behavior ([c34159d](https://github.com/o-lukas/homebridge-smartthings-tv/commit/c34159db0aefd13341535ab551ef31261289b8a3)), closes [#368](https://github.com/o-lukas/homebridge-smartthings-tv/issues/368)
* add property to permanently override display name ([9d34b29](https://github.com/o-lukas/homebridge-smartthings-tv/commit/9d34b29c56c99484b5621c4badd9aecdd55d33e4)), closes [#367](https://github.com/o-lukas/homebridge-smartthings-tv/issues/367)

# [2.0.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.0.2...v2.0.3) (2024-04-28)

### Bug Fixes

* renamed deviceBlacklist to deviceBlocklist ([eb04095](https://github.com/o-lukas/homebridge-smartthings-tv/commit/eb04095bf740539c2a7263ce57e88c79d6c24c61))

# [2.0.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.0.1...v2.0.2) (2024-04-27)

### Bug Fixes

* bump @smartthings/core-sdk from 8.1.3 to 8.1.4 ([1c03aca](https://github.com/o-lukas/homebridge-smartthings-tv/commit/1c03aca0c3d8ea2676681a08b7394bc8f31ad9f3))
* bump homebridge from 1.7.0 to 1.8.0 ([83002b3](https://github.com/o-lukas/homebridge-smartthings-tv/commit/83002b3dea40b6f9c65319b0d5032175343096c4))

# [2.0.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v2.0.0...v2.0.1) (2024-04-20)

### Bug Fixes

* update depencies to fix 2 moderate severity vulnerabilities ([c1a1c67](https://github.com/o-lukas/homebridge-smartthings-tv/commit/c1a1c67fd36ce44dec545f8a281da55ed7d1646b))

### Reverts

* Revert "build: only support node 20.x" ([f711123](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f711123198d88e5b9eb7baf05341e84b84d84176))

# [2.0.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.10.4...v2.0.0) (2024-03-16)

### ⚠ BREAKING CHANGES

* The support for Node 18.x has been dropped.

### Bug Fixes

* update follow-redirects peer dependency ([a89e520](https://github.com/o-lukas/homebridge-smartthings-tv/commit/a89e52062bc491602490e295dd3a5f4007a19547))

### Build System

* only support node 20.x ([a6edb33](https://github.com/o-lukas/homebridge-smartthings-tv/commit/a6edb330162ea789c10b17cab77a6274592b994d))

# [1.10.4](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.10.3...v1.10.4) (2024-03-10)

### Bug Fixes

* bump @smartthings/core-sdk from 8.1.2 to 8.1.3 ([52065fd](https://github.com/o-lukas/homebridge-smartthings-tv/commit/52065fdc46c3e0080c634d261e39d6eff0f0081e))

# [1.10.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.10.2...v1.10.3) (2024-01-14)

### Bug Fixes

* bump @smartthings/core-sdk from 8.1.1 to 8.1.2 ([2c137c0](https://github.com/o-lukas/homebridge-smartthings-tv/commit/2c137c08a73b016783295db04994c38aaf3f5bb6))

# [1.10.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.10.1...v1.10.2) (2023-12-08)

### Bug Fixes

* bump engine versions ([63e39e8](https://github.com/o-lukas/homebridge-smartthings-tv/commit/63e39e8a5e38966c843bd78918f7acf66c48da17))

# [1.10.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.10.0...v1.10.1) (2023-12-03)

### Bug Fixes

* fixed custom input sources begin registered as applications ([e3e5d72](https://github.com/o-lukas/homebridge-smartthings-tv/commit/e3e5d72d018bea48a5a55bccb3144e2761a30cb1))

# [1.10.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.9.1...v1.10.0) (2023-12-03)

### Features

* added custom application mapping ([f113332](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f11333209f84ad5b6d39699211a2c1edf5990758))
* added custom input sources mapping ([17cc1c1](https://github.com/o-lukas/homebridge-smartthings-tv/commit/17cc1c16a6aab63ce738cb9d0f13e42216ac1848))

### Bug Fixes

* bump axios to >1.6.0 ([c285256](https://github.com/o-lukas/homebridge-smartthings-tv/commit/c2852566035e8cd874f43b1e4f825a6abc8b0b21))

# [1.9.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.9.0...v1.9.1) (2023-10-29)

### Bug Fixes

* bump @smartthings/core-sdk from 8.1.0 to 8.1.1 ([5e3aa25](https://github.com/o-lukas/homebridge-smartthings-tv/commit/5e3aa25f395f0890111cd5787fe99ab98e9fdce5))

# [1.9.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.8.3...v1.9.0) (2023-10-26)

### Features

* status polling for power state, volume & active identifier ([#231](https://github.com/o-lukas/homebridge-smartthings-tv/issues/231)) ([85ccda5](https://github.com/o-lukas/homebridge-smartthings-tv/commit/85ccda5f4823df2f20d2a8b16745233ec74257da))

# [1.8.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.8.2...v1.8.3) (2023-10-24)

### Bug Fixes

* bump @smartthings/core-sdk from 8.0.1 to 8.1.0 ([f6fa478](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f6fa478bafcbcdd6458f3bf0d31a6d5c4d6e17ca))

# [1.8.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.8.1...v1.8.2) (2023-09-29)

### Bug Fixes

* bump @smartthings/core-sdk from 8.0.0 to 8.0.1 ([5d84065](https://github.com/o-lukas/homebridge-smartthings-tv/commit/5d840657ad09ef18ac75e325e30ab6559977fa42))

# [1.8.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.8.0...v1.8.1) (2023-09-28)

### Bug Fixes

* bump @smartthings/core-sdk from 7.1.1 to 8.0.0 ([23e5432](https://github.com/o-lukas/homebridge-smartthings-tv/commit/23e54325ed75bdd28b500cb9be74535809e286e4))

# [1.8.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.7.0...v1.8.0) (2023-08-29)

### Features

* **ignore:** added property to ignore devices ([cb760b7](https://github.com/o-lukas/homebridge-smartthings-tv/commit/cb760b756170f4941e132d3b5dd5163fb9ad175f))

# [1.7.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.6.0...v1.7.0) (2023-08-27)

### Features

* **volumeSlider:** added config parameter ([2598251](https://github.com/o-lukas/homebridge-smartthings-tv/commit/2598251079a66d93f13d4279329e9940b09fb59b))
* **volumeSlider:** implemented volume slider ([162dcdc](https://github.com/o-lukas/homebridge-smartthings-tv/commit/162dcdc4cd27a8ec95e6a15bd717e651372f8aa2))

### Bug Fixes

* added device id to accessory id ([b713f23](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b713f23d4611739f95637134bedbe18eea7bfa56))
* throw error when executing command fails ([4e8e2dd](https://github.com/o-lukas/homebridge-smartthings-tv/commit/4e8e2ddcb91182693a5faac6250aa813af1447fe))

# [1.6.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.5.0...v1.6.0) (2023-07-08)

### Features

* added device type x.com.st.d.monitor ([69453c2](https://github.com/o-lukas/homebridge-smartthings-tv/commit/69453c26ffd38115dc6232da4e6012292a2bcade))

### Bug Fixes

* bump @smartthings/core-sdk from 7.1.0 to 7.1.1 ([dff3146](https://github.com/o-lukas/homebridge-smartthings-tv/commit/dff3146581e9ee178e45918ea7800308fb6dc835))
* bump @types/node from 20.3.1 to 20.3.2 ([ee826bc](https://github.com/o-lukas/homebridge-smartthings-tv/commit/ee826bc7d45aaa5120a3f1cb6fad0c3746849a52))
* bump @types/node from 20.3.2 to 20.4.0 ([c98c687](https://github.com/o-lukas/homebridge-smartthings-tv/commit/c98c687a3e14177aaa82740735ea9e0856fdbe96))
* bump @typescript-eslint/eslint-plugin from 5.59.11 to 5.60.0 ([1258ce1](https://github.com/o-lukas/homebridge-smartthings-tv/commit/1258ce1dd321db06f3cd5b773cf1af3e052b43cb))
* bump @typescript-eslint/eslint-plugin from 5.60.0 to 5.60.1 ([05b9ddc](https://github.com/o-lukas/homebridge-smartthings-tv/commit/05b9ddc58e865623cfc4b7755951dae820ef98be))
* bump @typescript-eslint/eslint-plugin from 5.60.1 to 5.61.0 ([94fdb7b](https://github.com/o-lukas/homebridge-smartthings-tv/commit/94fdb7b8aff9363ac1529838f7732ca4fd150808))
* bump @typescript-eslint/parser from 5.59.11 to 5.60.0 ([9835d29](https://github.com/o-lukas/homebridge-smartthings-tv/commit/9835d292cbb0083b29cb284bc146363ad5482162))
* bump @typescript-eslint/parser from 5.60.0 to 5.60.1 ([4a24272](https://github.com/o-lukas/homebridge-smartthings-tv/commit/4a24272f48dc331532d8e44050043aed2f20b6fd))
* bump @typescript-eslint/parser from 5.60.1 to 5.61.0 ([1aec65c](https://github.com/o-lukas/homebridge-smartthings-tv/commit/1aec65ca95feab6403ae8d5320e881e1b4a47494))
* bump eslint from 8.42.0 to 8.43.0 ([74de082](https://github.com/o-lukas/homebridge-smartthings-tv/commit/74de0823f223ae9fbdbbfc3e39ed70826508e990))
* bump eslint from 8.43.0 to 8.44.0 ([2c3a165](https://github.com/o-lukas/homebridge-smartthings-tv/commit/2c3a1654f89d96270ec6eef9b6f3040ae0cf02ea))
* bump semantic-release from 21.0.5 to 21.0.7 ([41b90d4](https://github.com/o-lukas/homebridge-smartthings-tv/commit/41b90d43ef9182c799847205b868d975204b0d87))
* bump typescript from 5.1.3 to 5.1.5 ([22dc281](https://github.com/o-lukas/homebridge-smartthings-tv/commit/22dc28161cd5c4c3da99f10c81b611dc3e694243))
* bump typescript from 5.1.5 to 5.1.6 ([b4af0dc](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b4af0dc1695f71d675559ff616f0e3c3a19e2c48))
* crash on empty input sources array ([cb1ae7e](https://github.com/o-lukas/homebridge-smartthings-tv/commit/cb1ae7e6d9d4b2fa344d67ae837b6da2241fb7af))
* prevent illegal active identifier ([d8b20f5](https://github.com/o-lukas/homebridge-smartthings-tv/commit/d8b20f5d87ae08d018428b87a8c63e8cbe302f3c))

# [1.5.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.4.5...v1.5.0) (2023-06-17)

### Features

* register sound & picture modes separately ([312c8ae](https://github.com/o-lukas/homebridge-smartthings-tv/commit/312c8ae04285c91d1eb523d9671e2b3aef98fff7))

### Bug Fixes

* bump @types/node from 20.2.5 to 20.3.0 ([dafd3ed](https://github.com/o-lukas/homebridge-smartthings-tv/commit/dafd3ed1ba05a27094b4eb73336eefd900708bd0))
* bump @types/node from 20.3.0 to 20.3.1 ([8a6d36a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/8a6d36a033275fbb18fbbfd11de07a772013e579))
* bump @typescript-eslint/eslint-plugin from 5.59.8 to 5.59.9 ([45e679b](https://github.com/o-lukas/homebridge-smartthings-tv/commit/45e679bf0da268f6f0e94be7e558b17faabf033f))
* bump @typescript-eslint/eslint-plugin from 5.59.9 to 5.59.11 ([d94bb69](https://github.com/o-lukas/homebridge-smartthings-tv/commit/d94bb6975700b95726beeb63398ccde3820b5ab4))
* bump @typescript-eslint/parser from 5.59.8 to 5.59.9 ([a0b7e50](https://github.com/o-lukas/homebridge-smartthings-tv/commit/a0b7e50a776815ca7b760bce43690d7aab633fc1))
* bump @typescript-eslint/parser from 5.59.9 to 5.59.11 ([dbcf352](https://github.com/o-lukas/homebridge-smartthings-tv/commit/dbcf3526b82353829d5e6c8a76adf6749faefaff))
* bump semantic-release from 21.0.3 to 21.0.5 ([dc10629](https://github.com/o-lukas/homebridge-smartthings-tv/commit/dc106293ff14689715bac5736a678291aa02ab36))
* restore accessory caching ([b849b99](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b849b990dfe3d59c316a3e84833600764ecd2b0a))
* sound & display mode losing their names ([ac9b23a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/ac9b23a9da5d27ae0f6119b24955d2688fdfdd69))

# [1.4.5](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.4.4...v1.4.5) (2023-05-19)

### Bug Fixes

* set deviceId as serial number ([5644904](https://github.com/o-lukas/homebridge-smartthings-tv/commit/5644904478c25108964cb7f29bb6e1bae04d9141))

# [1.4.4](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.4.3...v1.4.4) (2023-04-23)

### Bug Fixes

* added warning when TV is not turned on ([dbecdec](https://github.com/o-lukas/homebridge-smartthings-tv/commit/dbecdec41dd9133aa79748f1e701453c792244fc))
* reset active identifier after registration ([b372a75](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b372a75e9dde7a0e5661797f57db74ae03968aab))
* wait for registration to finish ([2861f68](https://github.com/o-lukas/homebridge-smartthings-tv/commit/2861f6813c1f2c90d80299900d60aaaa907002f5))

# [1.4.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.4.2...v1.4.3) (2023-04-22)

### Bug Fixes

* added YouTubeTV application id ([fa58e74](https://github.com/o-lukas/homebridge-smartthings-tv/commit/fa58e741f452acbc58918f3af96a583f17779833))
* wait for input registrations ([f83dda8](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f83dda8ac101bdeb57012c002981ad1419f5287c))

# [1.4.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.4.1...v1.4.2) (2023-04-11)

### Bug Fixes

* manually update xml2js to fix CVE-2023-0842 ([cf1aa1c](https://github.com/o-lukas/homebridge-smartthings-tv/commit/cf1aa1c59267ceec49f8a5ec9a4da8b7cc9e1782))

# [1.4.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.4.0...v1.4.1) (2023-04-09)

### Bug Fixes

* added missing config property titles ([0492c71](https://github.com/o-lukas/homebridge-smartthings-tv/commit/0492c712273278e6aa083e2371d3be2186db8fe4))

# [1.4.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.3.2...v1.4.0) (2023-04-09)

### Features

* added flags for ping and wol functionalities ([f5e5ac4](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f5e5ac47766e08efb05492ca6efaa6fb9c3105ab))
* added validation patterns ([8dea24d](https://github.com/o-lukas/homebridge-smartthings-tv/commit/8dea24d006b68722a3931f3af8259a331f822e5f))

# [1.3.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.3.1...v1.3.2) (2023-04-04)

### Bug Fixes

* configure display name for mode switches ([418f24f](https://github.com/o-lukas/homebridge-smartthings-tv/commit/418f24f47b1edb2049a4f3feb2e08e89dd7d42f6))

# [1.3.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.3.0...v1.3.1) (2023-04-02)

### Bug Fixes

* improve error message for device registration ([4fe64aa](https://github.com/o-lukas/homebridge-smartthings-tv/commit/4fe64aa82ae578a7a6ed5101bb93952564cdbdab))

# [1.3.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.2.0...v1.3.0) (2023-04-02)

### Features

* added warning for proposed capabilities ([1b83756](https://github.com/o-lukas/homebridge-smartthings-tv/commit/1b837561fbf40fa79243a4f1209207c330ccb518))
* **soundMode:** add sound modes as switch ([458f7cf](https://github.com/o-lukas/homebridge-smartthings-tv/commit/458f7cf4f94151f0dee20b58f0214514009af5aa))

# [1.2.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.1.1...v1.2.0) (2023-04-02)

### Features

* **pictureMode:** add picture modes as switch ([4de73e3](https://github.com/o-lukas/homebridge-smartthings-tv/commit/4de73e35bf186d9c300fe744d6c2632acf63f943))
* **pictureMode:** added config property ([b39d83a](https://github.com/o-lukas/homebridge-smartthings-tv/commit/b39d83a4ff1cc315ac7c69dae43ae1570e87d254))

### Bug Fixes

* **pictureMode:** update all switches after change ([404c901](https://github.com/o-lukas/homebridge-smartthings-tv/commit/404c9019f6ab94c90c305eeafd732dd38cf47124))

# [1.1.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.1.0...v1.1.1) (2023-04-02)

### Bug Fixes

* crash on error when discovering devices ([520a323](https://github.com/o-lukas/homebridge-smartthings-tv/commit/520a323bf832fe95ab58ccb19609052b1c0b3057))
* **log:** changed log level of ignored devices ([facf3c2](https://github.com/o-lukas/homebridge-smartthings-tv/commit/facf3c27351767c102010833b57fccb721283b9f))

# [1.1.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.6...v1.1.0) (2023-04-01)

### Features

* **semantic-release:** added semantic release ([f410a26](https://github.com/o-lukas/homebridge-smartthings-tv/commit/f410a26db5723501ebea28ca0ae7b3c3386292d6))

# [1.0.6](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.5...v1.0.6) (2023-03-24)

### What's Changed

* improved documentation
* fixed crash on missing device mappings
* Bump nodemon from 2.0.21 to 2.0.22 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/39>
* Bump rimraf from 4.4.0 to 4.4.1 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/40>
* Bump @types/node from 18.15.5 to 18.15.6 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/42>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.5...v1.0.6>

# [1.0.5](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.4...v1.0.5) (2023-03-22)

### What's Changed

* Bump @typescript-eslint/eslint-plugin from 5.55.0 to 5.56.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/35>
* Bump @types/node from 18.15.3 to 18.15.5 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/37>
* Bump @typescript-eslint/parser from 5.55.0 to 5.56.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/36>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.4...v1.0.5>

# [1.0.4](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.3...v1.0.4) (2023-03-17)

### What's Changed

* added log message for wake-on-lan functionality
* Bump @types/node from 18.15.1 to 18.15.3 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/31>
* Bump @typescript-eslint/parser from 5.54.1 to 5.55.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/30>
* Bump @typescript-eslint/eslint-plugin from 5.54.1 to 5.55.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/29>
* Bump typescript from 4.9.5 to 5.0.2 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/33>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.3...v1.0.4>

# [1.0.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.2...v1.0.3) (2023-03-13)

### What's Changed

* Bump ping from 0.4.2 to 0.4.4 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/22>
* Bump rimraf from 4.3.0 to 4.4.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/23>
* Bump @typescript-eslint/parser from 5.54.0 to 5.54.1 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/24>
* Bump @typescript-eslint/eslint-plugin from 5.54.0 to 5.54.1 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/25>
* Bump @types/node from 18.14.6 to 18.15.1 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/26>
* Bump eslint from 8.35.0 to 8.36.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/27>
* Bump @smartthings/core-sdk from 5.2.0 to 5.3.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/28>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.2...v1.0.3>

# [1.0.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.1...v1.0.2) (2023-03-06)

### What's Changed

* Bump rimraf from 4.1.2 to 4.3.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/17>
* Bump nodemon from 2.0.20 to 2.0.21 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/18>
* Bump @typescript-eslint/eslint-plugin from 5.53.0 to 5.54.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/19>
* Bump @types/node from 18.14.2 to 18.14.6 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/20>
* Bump @typescript-eslint/parser from 5.53.0 to 5.54.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/21>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.1...v1.0.2>

# [1.0.1](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.0...v1.0.1) (2023-02-27)

### What's Changed

* Bump @typescript-eslint/parser from 5.52.0 to 5.53.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/16>
* Bump @types/node from 18.14.0 to 18.14.2 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/15>
* Bump @typescript-eslint/eslint-plugin from 5.52.0 to 5.53.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/14>
* Bump eslint from 8.34.0 to 8.35.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/13>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v1.0.0...v1.0.1>

# [1.0.0](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.6...v1.0.0) (2023-02-21)

### What's Changed

* First major release because of Homebridge verification in <https://github.com/homebridge/verified/issues/511>
* Bump @types/node from 18.13.0 to 18.14.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/10>
* Bump @typescript-eslint/parser from 5.0.0 to 5.52.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/11>
* Bump rimraf from 3.0.2 to 4.1.2 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/12>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.6...v1.0.0>

# [0.0.6](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.5...v0.0.6) (2023-02-19)

### What's Changed

* fixed deployment issues

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.4...v0.0.6>

# [0.0.5](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.4...v0.0.5) (2023-02-19)

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.4...v0.0.5>

# [0.0.4](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.3...v0.0.4) (2023-02-19)

### What's Changed

* catch errors when discovering devices by @o-lukas in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/9>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.3...v0.0.4>

# [0.0.3](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.2...v0.0.3) (2023-02-15)

### What's Changed

* Bump @types/node from 16.10.9 to 18.13.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/4>
* Bump eslint from 8.0.1 to 8.34.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/5>
* Bump typescript from 4.4.4 to 4.9.5 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/6>
* Bump @typescript-eslint/eslint-plugin from 5.0.0 to 5.52.0 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/7>
* Bump ts-node from 10.3.0 to 10.9.1 by @dependabot in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/8>

### New Contributors

* @dependabot made their first contribution in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/4>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.2...v0.0.3>

# [0.0.2](https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.1...v0.0.2) (2023-02-13)

### What's Changed

* Support applications by @o-lukas in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/2>

### New Contributors

* @o-lukas made their first contribution in <https://github.com/o-lukas/homebridge-smartthings-tv/pull/2>

**Full Changelog**: <https://github.com/o-lukas/homebridge-smartthings-tv/compare/v0.0.1...v0.0.2>

# 0.0.1 (2023-02-07)

First Release 🎉

**Current Feature-List:**

* dynamic registration of TVs in a SmartThings account
* dynamic registration of inputs
* support for iOS Remote
* optional Wake-on-Lan feature to turn TV on
* optional Ping feature for determining TV state
