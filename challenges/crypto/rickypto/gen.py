import random
from Crypto.Util.number import getPrime, bytes_to_long
from sage.all import OctonionAlgebra, Zmod

from teru_shigure_no_burein import flag, rk

def generate_data(flag):
    m = getPrime(64)
    
    chunk_size = 4
    flag_chunks = [flag[i:i+chunk_size] for i in range(0, len(flag), chunk_size)]
    
    for i in range(len(flag_chunks)):
        if len(flag_chunks[i]) < chunk_size:
            flag_chunks[i] = flag_chunks[i] + b'\x00' * (chunk_size - len(flag_chunks[i]))
    
    n_values = [bytes_to_long(chunk) for chunk in flag_chunks]
    
    p_values = []
    q_values = []
    
    O = OctonionAlgebra(Zmod(m))

    for i, n in enumerate(n_values):
        p = O(tuple(random.randint(1, m-1) for _ in range(8)))
        q = p ** n
        
        p_values.append(p.vector())
        q_values.append(q.vector())
    
    return m, p_values, q_values

if __name__ == "__main__":
    m, p_values, q_values = generate_data(flag + rk)

    print(f"m = {m}")
    print(f"p_values = {p_values}")
    print(f"q_values = {q_values}")
