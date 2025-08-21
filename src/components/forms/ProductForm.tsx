import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { Produto, Categoria, Fornecedor } from '@/types';
import { produtoService } from '@/services/api';
import { uploadFile, STORAGE_BUCKETS } from '@/lib/supabase';

const productSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo_sku: z.string().min(1, 'Código SKU é obrigatório'),
  categoria_id: z.string().min(1, 'Categoria é obrigatória'),
  fornecedor_id: z.string().min(1, 'Fornecedor é obrigatório'),
  descricao: z.string().optional(),
  unidade_medida: z.string().min(1, 'Unidade de medida é obrigatória'),
  valor_unitario: z.number().min(0, 'Preço de custo deve ser positivo'),
  preco: z.number().min(0, 'Preço de venda deve ser positivo'),
  codigo_barras: z.string().optional(),
  status: z.enum(['ativo', 'inativo'])
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  produto?: Produto | null;
  categorias: Categoria[];
  fornecedores: Fornecedor[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ 
  produto, 
  categorias, 
  fornecedores, 
  onSuccess, 
  onCancel 
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: produto?.nome || '',
      codigo_sku: produto?.codigo_sku || '',
      categoria_id: produto?.categoria_id || '',
      fornecedor_id: produto?.fornecedor_id || '',
      descricao: produto?.descricao || '',
      unidade_medida: produto?.unidade_medida || 'un',
      valor_unitario: produto?.valor_unitario || 0,
      preco: produto?.preco || 0,
      codigo_barras: produto?.codigo_barras || '',
      status: produto?.status || 'ativo'
    }
  });

  useEffect(() => {
    if (produto?.foto_url) {
      setUploadedImage(produto.foto_url);
    }
  }, [produto]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImageFile(null);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      let foto_url = produto?.foto_url;

      // Upload image if there's a new one
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const uploadResult = await uploadFile(
          STORAGE_BUCKETS.PRODUTOS, 
          fileName, 
          imageFile
        );
        
        if (uploadResult.data?.publicUrl) {
          foto_url = uploadResult.data.publicUrl;
        }
      }

      const productData = {
        ...data,
        foto_url: uploadedImage ? foto_url : undefined
      };

      if (produto) {
        await produtoService.update(produto.id, productData);
      } else {
        await produtoService.create(productData);
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const unidadesMedida = [
    { value: 'un', label: 'Unidade' },
    { value: 'kg', label: 'Quilograma' },
    { value: 'g', label: 'Grama' },
    { value: 'l', label: 'Litro' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'm', label: 'Metro' },
    { value: 'cm', label: 'Centímetro' },
    { value: 'pc', label: 'Peça' },
    { value: 'cx', label: 'Caixa' },
    { value: 'pct', label: 'Pacote' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <Card>
          <CardContent className="p-6">
            <Label>Foto do Produto</Label>
            <div className="mt-2">
              {uploadedImage ? (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <Label htmlFor="image-upload" className="cursor-pointer text-sm text-gray-600">
                    Clique para fazer upload de uma imagem
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo_sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código SKU *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fornecedor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fornecedores.map((fornecedor) => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidade_medida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade de Medida *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unidadesMedida.map((unidade) => (
                        <SelectItem key={unidade.value} value={unidade.value}>
                          {unidade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Pricing and Details */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="valor_unitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço de Custo *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço de Venda *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo_barras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código de barras" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Produto Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Produto disponível para movimentações
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'ativo'}
                      onCheckedChange={(checked) => 
                        field.onChange(checked ? 'ativo' : 'inativo')
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite uma descrição detalhada do produto"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : produto ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}