# 2.0.1
* Fixed the bug where we did not update `yarn.lock` files in `nearbridge` and `nearprover` during `2.0.0` release.

# 2.0.0
* Token locker that was used for ERC20 was removed. It now uses rainbow-token-connector.
* NearOnEthClient was rewritten to fix some critical issues. The following public methods were removed: `head`, `backupHead`, `backupCurrentBlockProducers`;
`replaceDuration` public method was added. The constructor now accepts additional argument `replaceDuration_` that allows resubmitting headers on the top of the headers that did not pass challenge period yet.
