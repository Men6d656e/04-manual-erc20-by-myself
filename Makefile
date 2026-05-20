.PHONY: all clean build test deploy-anvil deploy-sepolia

# Include .env file if it exists
-include .env

all: clean build test

clean:
	forge clean

build:
	forge build

test:
	forge test -vvvv

deploy-anvil:
	@echo "Deploying to Anvil local node..."
	PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
	forge script script/DeployManualToken.s.sol:DeployManualToken \
		--rpc-url http://127.0.0.1:8545 \
		--broadcast -vvvv

deploy-sepolia:
	@echo "Deploying to Sepolia testnet..."
	@if [ -z "$(SEPOLIA_RPC_URL)" ] || [ -z "$(PRIVATE_KEY)" ]; then \
		echo "Error: SEPOLIA_RPC_URL and PRIVATE_KEY must be set in .env"; \
		exit 1; \
	fi
	forge script script/DeployManualToken.s.sol:DeployManualToken \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvvv
