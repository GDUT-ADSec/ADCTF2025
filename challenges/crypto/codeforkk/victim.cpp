#include <fstream>
#include <iostream>
#include <ranges>
#include <unordered_map>

using u64 = std::int64_t;

constexpr auto max_nm = u64{20000};

auto main() -> int {
  auto fin = std::ifstream{"data.in"};
  auto fout = std::ofstream{"data.out"};
  std::cin.rdbuf(fin.rdbuf());
  std::cout.rdbuf(fout.rdbuf());

  auto num = std::unordered_map<u64, int>{};

  auto n = u64{};
  std::cin >> n;
  std::cerr << "n = " << n << std::endl;
  if (n > max_nm) {
    std::cerr << "n = " << n << " > " << max_nm << std::endl;
    return 1;
  }
  if (n < 1) {
    std::cerr << "n = " << n << " < 1" << std::endl;
    return 1;
  }
  for (auto _ : std::views::iota(0, n)) {
    auto x = 0ull;
    std::cin >> x;
    num[x]++;
  }

  auto m = u64{};
  std::cin >> m;
  std::cerr << "m = " << m << std::endl;
  if (m > max_nm) {
    std::cerr << "m = " << m << " > " << max_nm << std::endl;
    return 1;
  }
  if (m < 1) {
    std::cerr << "m = " << m << " < 1" << std::endl;
    return 1;
  }
  for (auto _ : std::views::iota(0, m)) {
    auto x = 0;
    std::cin >> x;
    std::cout << num[x] << "\n";
  }
}
